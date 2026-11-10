import { f2, fi, formatRange } from "./format.ts";
import { isGhostAd } from "./parse.ts";
import type { AdSummary, Agg, Snap, Tone, VerdictKey, View } from "./types.ts";

export type ChartKey =
  | "roas"
  | "cpa"
  | "ctr"
  | "freq"
  | "lpv"
  | "hook"
  | "hold"
  | "avgT"
  | "gasto"
  | "resultados"
  | "alcance"
  | "cr"
  | "dropoff"
  | "intent";

export type ChartMetric = {
  id: ChartKey;
  label: string;
  thresholds?: [number, number];
  hi?: boolean;
};

export const CHART_METRICS: ChartMetric[] = [
  { id: "roas", label: "ROAS (x)", thresholds: [1.5, 2.5], hi: true },
  { id: "cpa", label: "CPA (€)", thresholds: [10, 15], hi: false },
  { id: "ctr", label: "CTR enlace (%)", thresholds: [1.5, 2.5], hi: true },
  { id: "freq", label: "Frecuencia", thresholds: [1.4, 1.8], hi: false },
  { id: "lpv", label: "Carga LPV (%)", thresholds: [70, 85], hi: true },
  { id: "hook", label: "Hook rate (%)", thresholds: [20, 30], hi: true },
  { id: "hold", label: "Hold rate (%)", thresholds: [20, 35], hi: true },
  { id: "avgT", label: "Tiempo medio (s)", thresholds: [3, 5], hi: true },
  { id: "gasto", label: "Gasto (€)" },
  { id: "resultados", label: "Compras" },
  { id: "alcance", label: "Alcance" },
  { id: "cr", label: "CR global (%)", thresholds: [1, 1.5], hi: true },
  { id: "dropoff", label: "Fuga de carga (%)", thresholds: [15, 30], hi: false },
  { id: "intent", label: "Intención IC/ATC (%)", thresholds: [40, 55], hi: true },
];

export const CHART_GROUPS: { id: "ventas" | "alcance" | "video"; label: string; prefer: ChartKey; keys: ChartKey[] }[] = [
  { id: "ventas", label: "Ventas", prefer: "gasto", keys: ["gasto", "resultados"] },
  { id: "alcance", label: "Alcance", prefer: "alcance", keys: ["alcance", "freq", "ctr"] },
  { id: "video", label: "Vídeo", prefer: "hook", keys: ["hook", "hold", "avgT"] },
];

const ADDITIVE = new Set<ChartKey>(["gasto", "resultados", "alcance"]);

export const SPARK_KEYS: ChartKey[] = ["roas", "cpa", "ctr", "freq", "lpv", "hook", "hold", "avgT", "alcance"];

export const rules: Record<string, (v: number | null) => Tone> = {
  freq: (v) => (v == null ? "n" : v <= 1.4 ? "g" : v <= 1.8 ? "y" : "r"),
  ctr: (v) => (v == null ? "n" : v >= 2.5 ? "g" : v >= 1.5 ? "y" : "r"),
  lpv: (v) => (v == null ? "n" : v >= 85 ? "g" : v >= 70 ? "y" : "r"),
  cpa: (v) => (v == null ? "n" : v <= 10 ? "g" : v <= 15 ? "y" : "r"),
  roas: (v) => (v == null ? "n" : v >= 2.5 ? "g" : v >= 1.5 ? "y" : "r"),
  hook: (v) => (v == null ? "n" : v >= 30 ? "g" : v >= 20 ? "y" : "r"),
  avgT: (v) => (v == null ? "n" : v >= 5 ? "g" : v >= 3 ? "y" : "r"),
  hold: (v) => (v == null ? "n" : v >= 35 ? "g" : v >= 20 ? "y" : "r"),
  dropoff: (v) => (v == null ? "n" : v <= 15 ? "g" : v <= 30 ? "y" : "r"),
  cr: (v) => (v == null ? "n" : v >= 1 ? "g" : "r"),
  intent: (v) => (v == null ? "n" : v >= 55 ? "g" : v >= 40 ? "y" : "r"),
  watch: (v) => (v == null ? "n" : v >= 40 ? "g" : v >= 25 ? "y" : "r"),
};

export function toneFor(key: string, v: number | null): Tone {
  return rules[key]?.(v) ?? "n";
}

export function div(a: number | null | undefined, b: number | null | undefined, k = 1): number | null {
  if (a == null || b == null || !b || !Number.isFinite(a) || !Number.isFinite(b)) return null;
  const v = (a / b) * k;
  return Number.isFinite(v) ? v : null;
}

export function dayCount(s: { inicio: string; fin: string }): number {
  const a = Date.parse(`${s.inicio}T00:00:00Z`);
  const b = Date.parse(`${s.fin}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 1;
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function nonOverlap<T extends { inicio: string; fin: string }>(rows: T[]): T[] {
  const chosen: T[] = [];
  const sorted = [...rows].sort((a, b) => dayCount(b) - dayCount(a) || b.fin.localeCompare(a.fin));
  for (const s of sorted) {
    if (!chosen.some((c) => s.inicio <= c.fin && c.inicio <= s.fin)) chosen.push(s);
  }
  return chosen;
}

export function revenueOf(s: Snap): number | null {
  if (!(s.gasto > 0)) return null;
  if (s.purchaseValue != null && s.purchaseValue > 0) return s.purchaseValue;
  if (s.roas != null && s.roas > 0) return s.roas * s.gasto;
  return null;
}

export function viewOf(s: Snap, durOverride?: number | null): View {
  const dur = durOverride != null && durOverride > 0 ? durOverride : s.duration;
  const p50 = s.p50 ?? null;
  const endCount = s.p100 ?? s.p95 ?? s.thru ?? null;
  const retained = p50 != null ? p50 : endCount ?? s.p75 ?? null;
  const retentionSource: View["retentionSource"] =
    p50 != null ? "50%" : s.p100 != null ? "100%" : s.p95 != null ? "95%" : s.thru != null ? "ThruPlay" : s.p75 != null ? "75%" : null;
  const hook = div(s.v3s, s.impr, 100);
  const hold = div(retained, s.v3s, 100);
  const visUse = s.vis != null ? s.vis : s.lpv != null && s.clics > 0 ? (s.lpv * s.clics) / 100 : null;
  const dropoff = s.clics > 0 && visUse != null ? Math.max(0, ((s.clics - visUse) / s.clics) * 100) : null;
  const cr = div(s.resultados, s.clics, 100);
  const intent = s.atc != null ? div(s.ic, s.atc, 100) : null;
  const payRate = s.ic != null ? div(s.resultados, s.ic, 100) : null;
  const watch = dur != null && dur > 0 && s.avgT != null ? (s.avgT / dur) * 100 : null;
  return { ...s, retained, retentionSource, hook, hold, visUse, dropoff, cr, intent, payRate, watch, dur };
}

export function metricValue(v: View, key: ChartKey): number | null {
  switch (key) {
    case "roas":
      return v.roas;
    case "cpa":
      return v.cpa;
    case "ctr":
      return v.ctr;
    case "freq":
      return v.freq;
    case "lpv":
      return v.lpv;
    case "hook":
      return v.hook;
    case "hold":
      return v.hold;
    case "avgT":
      return v.avgT;
    case "gasto":
      return v.gasto;
    case "resultados":
      return v.resultados;
    case "alcance":
      return v.alcance;
    case "cr":
      return v.cr;
    case "dropoff":
      return v.dropoff;
    case "intent":
      return v.intent;
    default:
      return null;
  }
}

function sumNum(rows: View[], pick: (v: View) => number): number {
  return rows.reduce((a, row) => a + pick(row), 0);
}

function sumKnown(rows: View[], pick: (v: View) => number | null): { known: boolean; total: number } {
  let known = false;
  let total = 0;
  for (const row of rows) {
    const v = pick(row);
    if (v != null && Number.isFinite(v)) {
      known = true;
      total += v;
    }
  }
  return { known, total };
}

export function aggregate(history: Snap[], durOverride?: number | null): Agg {
  const chosen = nonOverlap(history).map((s) => viewOf(s, durOverride));
  return aggregateViews(chosen, history.length - chosen.length);
}

export function aggregateViews(rows: View[], skipped: number): Agg {
  const gasto = sumNum(rows, (r) => r.gasto);
  const resultados = sumNum(rows, (r) => r.resultados);
  const impr = sumNum(rows, (r) => r.impr);
  const clics = sumNum(rows, (r) => r.clics);
  let rev = 0;
  let spR = 0;
  let roasAdjusted = false;
  let roasFromValue = false;
  for (const s of rows) {
    if (s.roasAdjusted) roasAdjusted = true;
    if (s.roasOrigin === "value") roasFromValue = true;
    const revenue = revenueOf(s);
    if (revenue != null && revenue > 0 && s.gasto > 0) {
      rev += revenue;
      spR += s.gasto;
    }
  }
  const hookRows = rows.filter((r) => r.v3s != null);
  const holdRows = rows.filter((r) => r.retained != null && r.v3s != null);
  const midRows = rows.filter((r) => (r.p50 ?? null) != null && r.v3s != null);
  const lateRows = rows.filter((r) => r.p75 != null && r.v3s != null);
  const endRows = rows.filter((r) => (r.p100 ?? r.p95 ?? r.thru) != null && r.v3s != null);
  const timeRows = rows.filter((r) => r.avgT != null && (r.v3s ?? 0) > 0);
  const watchRows = rows.filter((r) => r.watch != null && (r.v3s ?? 0) > 0);
  const lpvRows = rows.filter((r) => r.vis != null || (r.lpv != null && r.clics > 0));
  const visE = lpvRows.reduce((a, r) => a + (r.vis != null ? r.vis : ((r.lpv ?? 0) * r.clics) / 100), 0);
  const lpvClicks = sumNum(lpvRows, (r) => r.clics);
  const lpvRaw = div(visE, lpvClicks, 100);
  const atc = sumKnown(rows, (r) => r.atc);
  const ic = sumKnown(rows, (r) => r.ic);
  const reach = sumKnown(rows, (r) => r.alcance);
  const latestFreq = [...rows].sort((a, b) => a.fin.localeCompare(b.fin)).reverse().find((r) => r.freq != null);
  const sources = [...new Set(rows.map((r) => r.retentionSource).filter((s): s is NonNullable<View["retentionSource"]> => !!s))];
  const watchWeight = watchRows.reduce((a, r) => a + (r.v3s ?? 0), 0);
  const hold50 = div(sumNum(midRows, (r) => r.p50 ?? 0), sumNum(midRows, (r) => r.v3s ?? 0), 100);
  const hold75 = div(sumNum(lateRows, (r) => r.p75 ?? 0), sumNum(lateRows, (r) => r.v3s ?? 0), 100);
  const complete = div(sumNum(endRows, (r) => r.p100 ?? r.p95 ?? r.thru ?? 0), sumNum(endRows, (r) => r.v3s ?? 0), 100);
  const retentionNote = hold50 != null
    ? "Hold: de quienes vieron 3 s, cuántos llegan a la mitad. El 75% y el cierre al 100% van debajo y no bajan este número."
    : sources.length
      ? `Este informe no trae la mitad del vídeo. El hold usa ${sources.join(", ")} ÷ vistas de 3 s.`
      : "Sin columnas de retención (50%, 75%, 100% o ThruPlay).";
  return {
    n: rows.length,
    skipped,
    gasto,
    resultados,
    cpa: div(gasto, resultados),
    roas: div(rev, spR),
    freq: latestFreq ? latestFreq.freq : null,
    ctr: div(clics, impr, 100),
    lpv: lpvRaw == null ? null : Math.min(100, lpvRaw),
    hook: div(sumNum(hookRows, (r) => r.v3s ?? 0), sumNum(hookRows, (r) => r.impr), 100),
    hold: div(sumNum(holdRows, (r) => r.retained ?? 0), sumNum(holdRows, (r) => r.v3s ?? 0), 100),
    hold50,
    hold75,
    complete,
    avgT: div(
      timeRows.reduce((a, r) => a + (r.avgT ?? 0) * (r.v3s ?? 0), 0),
      sumNum(timeRows, (r) => r.v3s ?? 0),
    ),
    watch: watchWeight ? watchRows.reduce((a, r) => a + (r.watch ?? 0) * (r.v3s ?? 0), 0) / watchWeight : null,
    alcance: reach.known ? reach.total : null,
    impr,
    clics,
    vis: lpvRows.length ? visE : null,
    atc: atc.known ? atc.total : null,
    ic: ic.known ? ic.total : null,
    dropoff: lpvClicks > 0 && lpvRows.length ? Math.max(0, ((lpvClicks - visE) / lpvClicks) * 100) : null,
    cr: div(resultados, clics, 100),
    intent: atc.known && ic.known ? div(ic.total, atc.total, 100) : null,
    payRate: ic.known ? div(resultados, ic.total, 100) : null,
    roasAdjusted,
    roasFromValue,
    retentionNote,
  };
}

export function summarize(snaps: Snap[], durations: Record<string, number>): AdSummary[] {
  const by = new Map<string, Snap[]>();
  for (const s of snaps) {
    if (isGhostAd(s.ad)) continue;
    const list = by.get(s.ad);
    if (list) list.push(s);
    else by.set(s.ad, [s]);
  }
  const out: AdSummary[] = [];
  for (const [ad, list] of by) {
    const history = [...list].sort((a, b) => (a.fin + a.inicio).localeCompare(b.fin + b.inicio));
    const latest = history[history.length - 1];
    const campaign = [...history].reverse().find((s) => s.campaign)?.campaign ?? "";
    out.push({ ad, campaign, history, latest, agg: aggregate(history, durations[ad]) });
  }
  return out;
}

export type Signals = {
  cpm: number | null;
  reactions: number | null;
  reactionRate: number | null;
  quality: string | null;
  convRank: string | null;
  created: string | null;
  ageDays: number | null;
  plays3: number | null;
  notes: string[];
  body: string;
};

function ageDays(created: string, fin: string): number | null {
  const a = Date.parse(`${created}T00:00:00Z`);
  const b = Date.parse(`${fin}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.round((b - a) / 86400000));
}

export function rankTone(label: string | null): Tone {
  if (!label) return "n";
  const n = label.toLowerCase();
  if (n.includes("debajo") || n.includes("below")) return "r";
  if (n.includes("encima") || n.includes("above")) return "g";
  if (n.includes("promedio") || n.includes("average")) return "y";
  return "n";
}

export function creativeSignals(history: Snap[], agg: Agg): Signals {
  const rows = nonOverlap(history);
  const cpm = div(agg.gasto, agg.impr, 1000);
  const withReactions = rows.filter((r) => r.reactions != null);
  const reactions = withReactions.length ? withReactions.reduce((a, r) => a + (r.reactions ?? 0), 0) : null;
  const reactionImpr = withReactions.reduce((a, r) => a + r.impr, 0);
  const reactionRate = reactions == null ? null : div(reactions, reactionImpr, 100);
  const latest = [...rows].sort((a, b) => b.fin.localeCompare(a.fin));
  const quality = latest.find((r) => r.quality)?.quality ?? null;
  const convRank = latest.find((r) => r.convRank)?.convRank ?? null;
  const created = rows.map((r) => r.created).filter((d): d is string => !!d).sort()[0] ?? null;
  const fin = latest[0]?.fin ?? "";
  const age = created && fin ? ageDays(created, fin) : null;
  const playRows = rows.filter((r) => r.v3s != null);
  const plays3 = playRows.length ? playRows.reduce((a, r) => a + (r.v3s ?? 0), 0) : null;

  const bits: string[] = [];
  if (agg.hook != null && cpm != null && agg.hook < 20 && cpm <= 8) {
    bits.push(`El CPM es ${f2(cpm)} € y el hook no llega al 20%. El fallo está en los 3 primeros segundos, no en lo que pagas por mil impresiones.`);
  } else if (agg.hook != null && cpm != null && agg.hook >= 30 && cpm >= 15) {
    bits.push(`El gancho aguanta (${f2(agg.hook)}%) y el CPM ya va por ${f2(cpm)} €. El límite está en la subasta o en el público, no en el arranque del vídeo.`);
  }
  if (age != null && agg.freq != null && age < 14 && agg.freq <= 1.8) {
    bits.push(`Tiene ${fi(age)} días (desde el ${formatRange(created!, created!)}) y la frecuencia es ${f2(agg.freq)}. No está fatigado: es un anuncio reciente.`);
  } else if (age != null && agg.freq != null && age >= 21 && agg.freq > 1.8) {
    bits.push(`Tiene ${fi(age)} días y la frecuencia ya es ${f2(agg.freq)}. La fatiga es del anuncio, no de un día malo.`);
  }
  if (plays3 != null && plays3 < 30 && agg.hold != null) {
    bits.push(`El hold sale de ${fi(plays3)} vistas de 3 segundos. Por debajo de 30 el porcentaje todavía no es estable.`);
  }
  return { cpm, reactions, reactionRate, quality, convRank, created, ageDays: age, plays3, notes: bits, body: bits.join(" ") };
}

export function accountOf(summaries: AdSummary[], durations: Record<string, number>): Agg {
  const views: View[] = [];
  let total = 0;
  for (const s of summaries) {
    total += s.history.length;
    views.push(...nonOverlap(s.history).map((row) => viewOf(row, durations[s.ad])));
  }
  return aggregateViews(views, total - views.length);
}

export function getVerdict(s: Agg): { k: VerdictKey; t: string; why: string } {
  const ok = s.resultados > 0;
  const cpaOk = s.cpa != null && s.cpa <= 10;
  const freqOk = s.freq == null || s.freq <= 1.8;
  if (s.gasto < 3) {
    return { k: "low", t: "Muestra baja", why: "Ha gastado menos de 3 €: los datos aún no son fiables para decidir." };
  }
  if (ok && ((s.roas != null && s.roas >= 2.5) || cpaOk) && freqOk && (s.lpv == null || s.lpv >= 70)) {
    return {
      k: "esc",
      t: "Escalar",
      why: "CPA o ROAS en rango óptimo, sin señal de fatiga. Sube el presupuesto poco a poco, un 20–30%.",
    };
  }
  if (s.ctr != null && s.ctr >= 2.5 && (!ok || !cpaOk)) {
    return {
      k: "var",
      t: "Variantes",
      why: "El anuncio atrae clics, pero el cierre no acompaña. Mira el embudo del sitio antes de culpar solo al gancho.",
    };
  }
  if (ok && s.roas != null && s.roas >= 1.5) {
    return { k: "var", t: "Variantes", why: "Rentabilidad justa. Prueba ganchos nuevos sin apagar todavía lo que ya vende." };
  }
  if (
    (!ok && s.gasto >= 15) ||
    (s.ctr != null && s.ctr < 1.5 && s.gasto >= 5) ||
    (ok && s.roas != null && s.roas < 1.5 && s.gasto >= 15) ||
    (s.freq != null && s.freq > 1.8 && (s.cpa == null || s.cpa > 15))
  ) {
    return {
      k: "apa",
      t: "Apagar",
      why: "Fatiga, CTR agotado o gasto relevante sin retorno. Corta este anuncio y no lo dejes drenar la cuenta.",
    };
  }
  return { k: "vig", t: "Vigilar", why: "Todavía está acumulando datos. No escales ni apagues hasta el siguiente informe." };
}

export type Read = { tone: Tone; title: string; body: string };

export function accountRead(a: Agg): Read {
  const roasT = rules.roas(a.roas);
  const cpaT = rules.cpa(a.cpa);
  const tone: Tone = roasT === "r" || cpaT === "r" ? "r" : roasT === "y" || cpaT === "y" ? "y" : roasT === "g" && cpaT === "g" ? "g" : roasT === "g" || cpaT === "g" ? "y" : "n";
  return {
    tone,
    title: tone === "g" ? "Cuenta en zona de escala" : tone === "y" ? "Cuenta en rentabilidad justa" : tone === "r" ? "Cuenta por debajo del corte" : "Cuenta sin lectura",
    body: tone === "n" ? "Todavía no hay CPA ni ROAS para leer la cuenta." : "El ROAS de la cuenta es valor de compras ÷ gasto de las filas que sí traen valor. No es una media de los anuncios.",
  };
}

export function dropoffRead(v: number | null): Read {
  if (v == null) {
    return { tone: "n", title: "Sin visitas a la landing", body: "Hace falta «Visitas a la página de destino» o el porcentaje de carga para medir la fuga entre el clic y la página." };
  }
  if (v > 30) {
    return { tone: "r", title: "Fuga crítica", body: "El problema es de velocidad o de URL, no del anuncio." };
  }
  if (v > 15) {
    return { tone: "y", title: "Fuga a vigilar", body: "La banda sana es 15% o menos. Por encima, la landing empieza a tirar clics." };
  }
  return { tone: "g", title: "La landing recoge el clic", body: "La página está cargando el tráfico que paga el anuncio." };
}

export function crRead(v: number | null): Read {
  if (v == null) {
    return { tone: "n", title: "Sin clics", body: "La conversión global es compras ÷ clics en el enlace. Todavía no hay clics." };
  }
  if (v >= 1.5) {
    return { tone: "g", title: "Por encima de la referencia", body: "Supera la banda sana de 1–1,5% de clics que terminan en compra." };
  }
  if (v >= 1) {
    return { tone: "g", title: "Dentro de la referencia", body: "Está dentro de la banda sana: 1–1,5% de los clics compran." };
  }
  return { tone: "r", title: "Por debajo de la referencia", body: "La referencia sana es 1–1,5%. El embudo no cierra lo que el anuncio trae." };
}

export function intentRead(a: Agg): Read {
  if (a.atc == null || a.ic == null) {
    return {
      tone: "n",
      title: "Faltan carrito e inicio de pago",
      body: "Exporta «Añadidos al carrito» e «Inicios de pago». Sin esas columnas no se puede saber si la fricción está antes del checkout o en el último paso del pago.",
    };
  }
  if (a.atc === 0) {
    return { tone: "y", title: "Nadie llega al carrito", body: "Hay clics, pero ningún añadido al carrito. La fricción está en la landing o en la oferta, antes del pago." };
  }
  const intent = a.intent ?? 0;
  const pay = a.payRate;
  if (intent >= 55 && pay != null && pay < 45) {
    return {
      tone: "r",
      title: "Fricción en el pago",
      body: "El corte está en el checkout: el formulario, la confianza o un coste que todavía aparece en el último paso.",
    };
  }
  if (intent < 40) {
    return {
      tone: "r",
      title: "Fricción antes del pago",
      body: "Se cae entre el carrito y el checkout: envío, formulario o precio, antes de pagar.",
    };
  }
  return {
    tone: rules.intent(intent),
    title: "La intención llega al pago",
    body: pay != null && pay < 45 ? "Los inicios de pago no se están cobrando. Revisa el último paso del checkout." : "No hay un corte claro en el paso de pago.",
  };
}

export function siteDiagnosis(a: Agg): Read {
  if (a.clics <= 0 && a.gasto <= 0) {
    return { tone: "n", title: "Sin tráfico que auditar", body: "Cuando haya clics y visitas a la landing, aquí verás en qué paso se pierde la compra." };
  }
  if (a.dropoff != null && a.dropoff > 30) return dropoffRead(a.dropoff);
  const intent = intentRead(a);
  if (intent.tone === "r" || intent.tone === "y") return intent;
  if (a.cr != null && a.cr < 1) return crRead(a.cr);
  if (a.dropoff != null && a.dropoff > 15) return dropoffRead(a.dropoff);
  return {
    tone: "g",
    title: "El sitio no es el cuello evidente",
    body: "Carga, paso a pago y conversión de clic no marcan un corte crítico. Si el anuncio no escala, el límite está en el coste del clic o en el valor del pedido.",
  };
}

export function buildTimeline(history: Snap[], key: ChartKey, dur?: number | null) {
  if (!history.length) {
    return { days: [] as string[], main: [] as (number | null)[], range: [] as (number | null)[], missing: [] as string[] };
  }
  const dmin = history.reduce((m, s) => (s.inicio < m ? s.inicio : m), history[0].inicio);
  const dmax = history.reduce((m, s) => (s.fin > m ? s.fin : m), history[0].fin);
  const days: string[] = [];
  for (let t = Date.parse(`${dmin}T00:00:00Z`); days.length < 400; t += 86400000) {
    const iso = new Date(t).toISOString().slice(0, 10);
    days.push(iso);
    if (iso >= dmax) break;
  }
  const daily = new Map<string, Snap>();
  for (const s of history) if (dayCount(s) === 1) daily.set(s.fin, s);
  const ranges = history.filter((s) => dayCount(s) > 1).sort((a, b) => dayCount(b) - dayCount(a));
  const rangeOf = (d: string) => ranges.find((r) => r.inicio <= d && d <= r.fin);
  const valueOf = (s: Snap, avg: boolean) => {
    const n = metricValue(viewOf(s, dur), key);
    if (n == null) return null;
    return avg && ADDITIVE.has(key) ? n / dayCount(s) : n;
  };
  const main = days.map((d) => {
    const s = daily.get(d);
    return s ? valueOf(s, false) : null;
  });
  const range = days.map((d) => {
    if (daily.has(d)) return null;
    const r = rangeOf(d);
    return r ? valueOf(r, true) : null;
  });
  const missing = days.filter((d) => !daily.has(d) && !rangeOf(d));
  return { days, main, range, missing };
}

export function sparkPoints(history: Snap[], key: ChartKey, dur?: number | null): { label: string; value: number | null }[] {
  const days = history.filter((s) => dayCount(s) === 1);
  const base = days.length >= 2 ? days : history;
  return base.map((s) => ({ label: formatRange(s.inicio, s.fin), value: metricValue(viewOf(s, dur), key) }));
}

export function sparkValues(history: Snap[], key: ChartKey, dur?: number | null): (number | null)[] {
  return sparkPoints(history, key, dur).map((p) => p.value);
}

export function availableMetrics(history: Snap[], dur?: number | null): ChartKey[] {
  return CHART_METRICS.map((m) => m.id).filter((id) => history.some((s) => metricValue(viewOf(s, dur), id) != null));
}

export const LEGEND: { name: string; rule: string }[] = [
  { name: "Frecuencia", rule: "verde ≤ 1,40 · amarillo 1,41–1,80 · rojo > 1,80. En el acumulado se muestra la del último informe: no se promedia." },
  { name: "CTR enlace", rule: "verde ≥ 2,50% · amarillo 1,50–2,49% · rojo < 1,50%. Se usa el CTR de clic en el enlace, no el CTR de todos los clics." },
  { name: "Carga LPV", rule: "verde ≥ 85% · amarillo 70–84,9% · rojo < 70%." },
  { name: "Fuga de carga", rule: "clics que no llegan a la landing. Verde ≤ 15% · amarillo 15–30% · rojo > 30% (crítico)." },
  { name: "CPA", rule: "verde ≤ 10 € · amarillo 10,01–15 € · rojo > 15 €." },
  { name: "ROAS", rule: "verde ≥ 2,50x · amarillo 1,50–2,49x · rojo < 1,50x. Si el Excel trae 250 o 250%, se lee como 2,50x. Si falta la columna, se calcula valor de compras ÷ gasto." },
  { name: "CR global", rule: "compras ÷ clics en el enlace. Referencia sana 1–1,5%. Por debajo de 1% queda en rojo." },
  { name: "Hook rate", rule: "visualizaciones de 3 s ÷ impresiones. Verde ≥ 30% · amarillo 20–29,9% · rojo < 20%." },
  { name: "Hold rate", rule: "retención final (100%, si no 95%, ThruPlay o 75%) ÷ visualizaciones de 3 s. Verde ≥ 35% · amarillo 20–34,9% · rojo < 20%." },
  { name: "Tiempo medio", rule: "verde ≥ 5 s · amarillo 3–4,9 s · rojo < 3 s." },
  { name: "Visto del vídeo", rule: "tiempo medio ÷ duración. Verde ≥ 40% · amarillo 25–39,9% · rojo < 25%. Usa la duración del informe o la que indiques." },
  { name: "Intención IC/ATC", rule: "inicios de pago ÷ añadidos al carrito. Si es alta y compras/inicios es baja, la fricción está en el último paso del checkout. Si es baja, está antes de pagar." },
  { name: "Acumulado", rule: "sumas, no medias de porcentajes. Los informes que se solapan en fechas se excluyen para no duplicar gasto. El alcance es suma de alcances diarios, no alcance único." },
];
