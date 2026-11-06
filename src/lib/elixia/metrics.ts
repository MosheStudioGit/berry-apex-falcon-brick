import { f2, formatRange } from "./format.ts";
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
  { id: "ventas", label: "Ventas", prefer: "roas", keys: ["gasto", "resultados", "cpa", "roas"] },
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
  const retentionSource = s.p100 != null ? "100%" : s.p95 != null ? "95%" : s.thru != null ? "ThruPlay" : s.p75 != null ? "75%" : null;
  const retained = s.p100 ?? s.p95 ?? s.thru ?? s.p75 ?? null;
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
    retentionNote: sources.length ? `Retención final: ${sources.join(", ")}` : "Sin columna de retención final (100%, 95%, ThruPlay o 75%).",
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
    body: `CPA ${a.cpa == null ? "sin compras" : f2(a.cpa) + " €"} y ROAS ${a.roas == null ? "sin valor de compras" : f2(a.roas) + "x"}. Verde solo si el CPA es ≤ 10 € y el ROAS ≥ 2,50x. El ROAS de cuenta es valor de compras ÷ gasto, no una media de porcentajes.`,
  };
}

export function dropoffRead(v: number | null): Read {
  if (v == null) {
    return { tone: "n", title: "Sin visitas a la landing", body: "Hace falta «Visitas a la página de destino» o el porcentaje de carga para medir la fuga entre el clic y la página." };
  }
  if (v > 30) {
    return { tone: "r", title: "Fuga crítica", body: `Se pierde el ${f2(v)}% de los clics antes de cargar la landing. Por encima del 30% el problema es de velocidad o de URL, no del anuncio.` };
  }
  if (v > 15) {
    return { tone: "y", title: "Fuga a vigilar", body: `Se pierde el ${f2(v)}%. La banda sana es 15% o menos, la misma que una carga LPV de al menos 85%.` };
  }
  return { tone: "g", title: "La landing recoge el clic", body: `Solo se pierde el ${f2(v)}% entre el clic y la visita. La página está cargando el tráfico que paga el anuncio.` };
}

export function crRead(v: number | null): Read {
  if (v == null) {
    return { tone: "n", title: "Sin clics", body: "La conversión global es compras ÷ clics en el enlace. Todavía no hay clics." };
  }
  if (v >= 1.5) {
    return { tone: "g", title: "Por encima de la referencia", body: `${f2(v)}% de los clics terminan en compra. La banda sana de referencia es 1–1,5% y este tráfico la supera.` };
  }
  if (v >= 1) {
    return { tone: "g", title: "Dentro de la referencia", body: `${f2(v)}% de los clics compran. Está dentro de la banda sana de 1–1,5%.` };
  }
  return { tone: "r", title: "Por debajo de la referencia", body: `${f2(v)}% de los clics compran. La referencia sana es 1–1,5%: el embudo no cierra lo que el anuncio trae.` };
}

export function intentRead(a: Agg): Read {
  if (a.atc == null || a.ic == null) {
    return {
      tone: "n",
      title: "Faltan carrito e inicio de pago",
      body: "Exporta «Añadidos al carrito» e «Inicios de pago». Sin esas columnas no se puede saber si la fricción está antes del checkout o en el recargo de 2,99 € contrareembolso.",
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
      body: `El ${f2(intent)}% de los carritos inicia el pago, pero solo el ${f2(pay)}% de esos inicios se cobra. El corte está en el checkout: recargo de 2,99 € contrareembolso, costes que aparecen tarde o desconfianza en el último paso.`,
    };
  }
  if (intent < 40) {
    return {
      tone: "r",
      title: "Fricción antes del pago",
      body: `Solo el ${f2(intent)}% de los carritos inicia el pago. No es el recargo de 2,99 €: se cae entre el carrito y el checkout (envío, formulario o precio).`,
    };
  }
  return {
    tone: rules.intent(intent),
    title: "La intención llega al pago",
    body: `El ${f2(intent)}% de los carritos inicia el pago${pay != null ? ` y el ${f2(pay)}% de esos inicios compra` : ""}. No hay un corte claro ligado al contrareembolso.`,
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
  { name: "Tiempo medio", rule: "verde ≥ 5 s · amarillo 3–4,9 s · rojo < 3 s. El ratio tiempo/duración usa la duración del informe o la que indiques." },
  { name: "Intención IC/ATC", rule: "inicios de pago ÷ añadidos al carrito. Si es alta y compras/inicios es baja, la fricción está en el pago (por ejemplo el recargo de 2,99 €). Si es baja, está antes del checkout." },
  { name: "Acumulado", rule: "sumas, no medias de porcentajes. Los informes que se solapan en fechas se excluyen para no duplicar gasto. El alcance es suma de alcances diarios, no alcance único." },
];
