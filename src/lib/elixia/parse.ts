import type { RoasOrigin, Snap } from "./types.ts";

export type InputCell =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | { v?: unknown; pct?: boolean };

export type InputRow = Record<string, InputCell>;

export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/[^a-z0-9% ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseLooseNumber(v: unknown): { n: number | null; explicitPct: boolean } {
  if (typeof v === "number") return { n: Number.isFinite(v) ? v : null, explicitPct: false };
  if (v == null || typeof v === "boolean" || v instanceof Date) return { n: null, explicitPct: false };
  let s = String(v).trim();
  if (!s || s === "-" || s === "—" || s === "–" || s.toLowerCase() === "n/a") return { n: null, explicitPct: false };
  const explicitPct = s.includes("%");
  s = s.replace(/\s/g, "").replace(/[€$£x×]/gi, "").replace(/%/g, "");
  if (!s || s === "-" || s === "+") return { n: null, explicitPct };
  const hasC = s.includes(",");
  const hasD = s.includes(".");
  if (hasC && hasD) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (hasC) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2) s = `${parts[0].replace(/\./g, "")}.${parts[1]}`;
    else s = s.replace(/,/g, "");
  }
  const n = Number(s);
  return { n: Number.isFinite(n) ? n : null, explicitPct };
}

export function toIsoDate(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "number" && v > 20000 && v < 80000) {
    return new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

export function toSec(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.includes(":")) {
    const parts = v.trim().split(":").map(Number);
    if (parts.length < 2 || parts.some((x) => !Number.isFinite(x))) return null;
    return parts.reduce((a, x) => a * 60 + x, 0);
  }
  return parseLooseNumber(v).n;
}

function unwrap(cell: InputCell | undefined): { value: unknown; pct: boolean } {
  if (cell && typeof cell === "object" && !(cell instanceof Date) && "v" in cell) {
    return { value: cell.v ?? null, pct: !!cell.pct };
  }
  return { value: cell, pct: false };
}

function numFrom(cell: InputCell | undefined, kind: "rate" | "roas" | "plain"): { n: number | null; adjusted: boolean } {
  const { value, pct } = unwrap(cell);
  const parsed = parseLooseNumber(value);
  if (parsed.n == null) return { n: null, adjusted: false };
  if (kind === "rate") {
    if (parsed.explicitPct) return { n: parsed.n, adjusted: false };
    if (pct) return { n: parsed.n * 100, adjusted: true };
    return { n: parsed.n, adjusted: false };
  }
  if (kind === "roas") {
    if (parsed.explicitPct) return { n: parsed.n / 100, adjusted: true };
    if (pct) return { n: parsed.n, adjusted: false };
    if (parsed.n > 20) return { n: parsed.n / 100, adjusted: true };
    return { n: parsed.n, adjusted: false };
  }
  return { n: parsed.n, adjusted: false };
}

function ranked(keys: string[], pred: (k: string) => boolean, rank: (k: string) => number): string[] {
  return keys.filter(pred).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

function pick(keys: string[], pred: (k: string) => boolean, rank: (k: string) => number = (k) => k.length): string | undefined {
  let best: string | undefined;
  let score = Infinity;
  for (const k of keys) {
    if (!pred(k)) continue;
    const r = rank(k);
    if (r < score) {
      score = r;
      best = k;
    }
  }
  return best;
}

function notMoney(k: string): boolean {
  return !/costo|coste|cost |valor|roas|retorno|ingreso/.test(k);
}

function collect(rows: InputRow[]): Map<string, string> {
  const original = new Map<string, string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      const n = norm(key);
      if (n && !original.has(n)) original.set(n, key);
    }
  }
  return original;
}

export function isGhostAd(name: string): boolean {
  const n = norm(name);
  return !n || n === "0" || n === "total" || n === "cuenta" || n.startsWith("total ") || n === "resultados totales";
}

function rankText(cell: InputCell | undefined): string | null {
  const raw = String(unwrap(cell).value ?? "").trim();
  const n = norm(raw);
  if (!n || n === "0" || n === "na" || n === "n a" || n.includes("sin clasificar") || n === "unknown") return null;
  return raw.slice(0, 80);
}

function isActive(v: unknown): boolean {
  const s = norm(String(v ?? ""));
  if (!s) return false;
  if (/inactiv|paus|archiv|rechaz|reject|complet|off|not /.test(s)) return false;
  return s === "active" || s === "activo" || s.startsWith("active") || s.startsWith("activo");
}

export function rowsToSnaps(rows: InputRow[]): Snap[] {
  if (!rows.length) return [];
  const original = collect(rows);
  const keys = [...original.keys()];
  const col = {
    ad: pick(keys, (k) => k === "nombre del anuncio" || k === "ad name" || k === "anuncio"),
    adset: pick(keys, (k) => k.includes("conjunto de anuncios") || k === "ad set name"),
    campaign: pick(keys, (k) => k === "nombre de la campana" || k === "campaign name" || k.startsWith("nombre de la campana")),
    inicio: pick(keys, (k) => k.startsWith("inicio del informe") || k.startsWith("reporting starts")),
    fin: pick(keys, (k) => k.startsWith("fin del informe") || k.startsWith("reporting ends")),
    dia: pick(keys, (k) => k === "dia" || k === "day" || k === "fecha" || k === "date"),
    purchases: pick(
      keys,
      (k) => notMoney(k) && (/(^| )compras($| )/.test(k) || /(^| )purchases($| )/.test(k) || k === "compra" || k === "purchase"),
      (k) => (k === "compras" || k === "purchases" ? 0 : k.includes("sitio") || k.includes("website") ? 2 : 1) + k.length / 1000,
    ),
    results: pick(
      keys,
      (k) => notMoney(k) && !k.includes("inicial") && (k === "resultados" || k === "results" || (k.startsWith("resultados ") && !k.includes("indicador"))),
    ),
    cpa: pick(keys, (k) => k.startsWith("costo por resultados") || k.startsWith("costo por compra") || k.startsWith("cost per result") || k === "cpa" || k.startsWith("cpa ")),
    freq: pick(keys, (k) => k === "frecuencia" || k === "frequency" || k.startsWith("frecuencia ")),
    ctr: pick(
      keys,
      (k) => k === "ctr" || k.startsWith("ctr "),
      (k) => (k.includes("enlace") || k.includes("link") ? 0 : 5) + (k.includes("todos") || k.includes("all") ? 3 : 0) + k.length / 10000,
    ),
    lpv: pick(keys, (k) => (k.includes("porcentaje") && k.includes("visita") && k.includes("pagina")) || k.includes("landing page view rate")),
    impr: pick(keys, (k) => {
      if (/costo|coste|cpm|unica|unique/.test(k)) return false;
      return k === "impresiones" || k.startsWith("impresiones ") || k === "impressions" || k.startsWith("impressions ");
    }),
    clics: pick(keys, (k) => {
      if (!notMoney(k) || /ctr|cpc|unico|unique|saliente|outbound/.test(k)) return false;
      const click = k.includes("clics") || k.includes("clicks");
      const link = k.includes("enlace") || k.includes("link");
      return click && link;
    }),
    alcance: pick(keys, (k) => {
      if (/costo|coste|cost /.test(k)) return false;
      return k === "alcance" || k.startsWith("alcance ") || k === "reach" || k.startsWith("reach ");
    }),
    cpc: pick(keys, (k) => (k.startsWith("cpc") || k.includes("costo por clic") || k.includes("cost per link")) && (k.includes("enlace") || k.includes("link") || k.startsWith("cpc"))),
    plays: pick(keys, (k) => {
      if (/3|thruplay|hasta|%|promedio|tiempo|costo|cost |continu/.test(k)) return false;
      return k === "reproducciones de video" || k === "video plays" || k === "reproducciones";
    }),
    v3s: pick(keys, (k) => /3\s*s|3 seg|3 second/.test(k) && /reproduc|video|play|visualiz/.test(k)),
    p100: pick(keys, (k) => /reproduc|video|play|visualiz/.test(k) && (k.includes("hasta el 100") || k.includes("100%") || k.includes("at 100"))),
    p95: pick(keys, (k) => /reproduc|video|play|visualiz/.test(k) && (k.includes("hasta el 95") || k.includes("95%") || k.includes("at 95"))),
    p75: pick(keys, (k) => /reproduc|video|play|visualiz/.test(k) && (k.includes("hasta el 75") || k.includes("75%") || k.includes("at 75"))),
    p50: pick(keys, (k) => /reproduc|video|play|visualiz/.test(k) && (k.includes("hasta el 50") || k.includes("50%") || k.includes("at 50")) && !k.includes("150")),
    thru: pick(keys, (k) => k.includes("thruplay") || k.includes("reproducciones continuas")),
    vis: pick(keys, (k) => {
      if (/porcentaje|costo|coste|cost |rate/.test(k)) return false;
      return (k.startsWith("visitas a la pagina") || k === "landing page views" || k.startsWith("landing page views"));
    }),
    avgT: pick(keys, (k) => k.includes("tiempo promedio") || k.includes("average video play") || k.includes("video average play")),
    duration: pick(keys, (k) => k.includes("duracion") && (k.includes("video") || k.includes("anuncio"))),
    atc: pick(keys, (k) => notMoney(k) && (k.includes("al carrito") || k.includes("add to cart") || k.includes("adds to cart"))),
    ic: pick(keys, (k) => {
      if (!notMoney(k)) return false;
      return (
        k.includes("inicios de pago") ||
        k.includes("pagos iniciados") ||
        k.includes("inicio de pago") ||
        k.includes("inicios del pago") ||
        k.includes("proceso de pago") ||
        k.includes("finalizacion de compra") ||
        k.includes("checkout")
      );
    }),
    delivery: pick(keys, (k) => k.includes("entrega del anuncio") || k === "ad delivery" || k === "delivery" || k.includes("delivery status")),
    reactions: pick(keys, (k) => k.includes("reacciones") || k.includes("post reaction") || k === "reactions"),
    quality: pick(keys, (k) => k.includes("clasificacion de calidad") || k.includes("quality ranking")),
    convRank: pick(keys, (k) => (k.includes("clasificacion") && k.includes("conversion")) || k.includes("conversion rate ranking")),
    created: pick(keys, (k) => k.startsWith("fecha de creacion") || k.startsWith("ad created") || k === "created time"),
  };
  const roasKeys = ranked(
    keys,
    (k) => k.includes("roas") && !/movil|mobile| app/.test(k),
    (k) => (k.includes("compra") || k.includes("purchase") ? (k.includes("sitio") || k.includes("website") ? 0 : 1) : 10) + k.length / 1000,
  );
  const spendKeys = ranked(
    keys,
    (k) => {
      if (/costo|coste|cpc|cpm|por resultado|por compra/.test(k)) return false;
      return k.startsWith("monto gastado") || k.startsWith("importe gastado") || k.startsWith("amount spent") || k === "gasto" || k === "spend";
    },
    (k) => k.length,
  );
  const valueKeys = ranked(
    keys,
    (k) => {
      if (k.includes("roas") || k.includes("reglas de valor") || k.includes("value rule") || /costo|coste|cost /.test(k)) return false;
      return (/valor|ingreso|conversion value|revenue/.test(k) && (k.includes("compra") || k.includes("purchase")));
    },
    (k) => k.length,
  );

  const read = (row: InputRow, key?: string) => (key ? row[original.get(key) ?? ""] : undefined);
  const firstNum = (row: InputRow, list: string[], kind: "rate" | "roas" | "plain") => {
    for (const key of list) {
      const got = numFrom(read(row, key), kind);
      if (got.n != null) return got;
    }
    return { n: null, adjusted: false };
  };

  const out: Snap[] = [];
  for (const row of rows) {
    const adRaw = read(row, col.ad) ?? read(row, col.adset) ?? read(row, col.campaign);
    const adName = String(unwrap(adRaw).value ?? "").trim();
    const delivery = read(row, col.delivery);
    const deliveryRaw = unwrap(delivery).value;
    const deliveryIsTotal = deliveryRaw === 0 || deliveryRaw === "0";
    if (isGhostAd(adName) || (deliveryIsTotal && isGhostAd(adName || "0"))) continue;
    const inicio = toIsoDate(unwrap(read(row, col.inicio)).value) ?? toIsoDate(unwrap(read(row, col.dia)).value);
    const fin = toIsoDate(unwrap(read(row, col.fin)).value) ?? inicio;
    if (!inicio || !fin) continue;

    const spend = firstNum(row, spendKeys, "plain").n ?? 0;
    const purchasesCell = col.purchases ? read(row, col.purchases) : undefined;
    const resultsCell = col.results ? read(row, col.results) : undefined;
    const purchases = numFrom(purchasesCell ?? resultsCell, "plain").n ?? 0;
    const purchaseValue = firstNum(row, valueKeys, "plain").n;
    const roasResolved = (() => {
      for (const key of roasKeys) {
        const fromCol = numFrom(read(row, key), "roas");
        if (fromCol.n != null && fromCol.n > 0) return { roas: fromCol.n, adjusted: fromCol.adjusted, origin: "column" as RoasOrigin };
      }
      if (purchaseValue != null && spend > 0) return { roas: purchaseValue / spend, adjusted: false, origin: "value" as RoasOrigin };
      return { roas: null, adjusted: false, origin: "none" as RoasOrigin };
    })();
    let cpa = numFrom(read(row, col.cpa), "plain").n;
    if (cpa == null && purchases > 0) cpa = spend / purchases;
    const impr = numFrom(read(row, col.impr), "plain").n ?? 0;
    const ctr = numFrom(read(row, col.ctr), "rate").n;
    const clicsRaw = col.clics ? numFrom(read(row, col.clics), "plain") : { n: null, adjusted: false };
    let clics = clicsRaw.n ?? 0;
    if (clicsRaw.n == null) {
      const cpc = numFrom(read(row, col.cpc), "plain").n;
      if (ctr != null && impr) clics = Math.round((ctr * impr) / 100);
      else if (cpc && spend) clics = Math.round(spend / cpc);
    }
    const vis = numFrom(read(row, col.vis), "plain").n;
    let lpv = numFrom(read(row, col.lpv), "rate").n;
    if (lpv == null && vis != null && clics > 0) lpv = Math.min(100, (vis / clics) * 100);
    const campaign = String(unwrap(read(row, col.campaign)).value ?? "").trim();

    out.push({
      ad: adName,
      campaign,
      inicio,
      fin,
      activo: delivery != null && isActive(unwrap(delivery).value),
      gasto: spend,
      resultados: purchases,
      cpa,
      roas: roasResolved.roas,
      roasAdjusted: roasResolved.adjusted,
      roasOrigin: roasResolved.origin,
      purchaseValue,
      freq: numFrom(read(row, col.freq), "plain").n,
      ctr,
      lpv,
      impr,
      clics,
      alcance: numFrom(read(row, col.alcance), "plain").n,
      plays: numFrom(read(row, col.plays), "plain").n,
      v3s: numFrom(read(row, col.v3s), "plain").n,
      p50: numFrom(read(row, col.p50), "plain").n,
      p75: numFrom(read(row, col.p75), "plain").n,
      p95: numFrom(read(row, col.p95), "plain").n,
      p100: numFrom(read(row, col.p100), "plain").n,
      thru: numFrom(read(row, col.thru), "plain").n,
      vis,
      avgT: toSec(unwrap(read(row, col.avgT)).value),
      duration: toSec(unwrap(read(row, col.duration)).value),
      atc: col.atc ? numFrom(read(row, col.atc), "plain").n : null,
      ic: col.ic ? numFrom(read(row, col.ic), "plain").n : null,
      reactions: numFrom(read(row, col.reactions), "plain").n,
      quality: rankText(read(row, col.quality)),
      convRank: rankText(read(row, col.convRank)),
      created: toIsoDate(unwrap(read(row, col.created)).value),
    });
  }
  return out;
}

type SheetCell = { v?: unknown; w?: string; z?: string };

export async function bufferToSnaps(data: ArrayBuffer | Uint8Array): Promise<Snap[]> {
  const XLSX = await import("xlsx");
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const zip = bytes.length > 3 && bytes[0] === 0x50 && bytes[1] === 0x4b;
  const ole = bytes.length > 4 && bytes[0] === 0xd0 && bytes[1] === 0xcf;
  let text = "";
  if (!zip && !ole) {
    text = new TextDecoder().decode(bytes).replace(/^\uFEFF/, "");
    const first = text.split(/\r?\n/, 1)[0] ?? "";
    const semis = first.split(";").length;
    const commas = first.split(",").length;
    const wb = XLSX.read(text, { type: "string", FS: semis > commas ? ";" : "," });
    const all: Snap[] = [];
    for (const name of wb.SheetNames) all.push(...rowsToSnaps(sheetToRows(wb.Sheets[name])));
    return all;
  }
  const wb = XLSX.read(bytes, { type: "array" });
  const all: Snap[] = [];
  for (const name of wb.SheetNames) all.push(...rowsToSnaps(sheetToRows(wb.Sheets[name])));
  return all;
}

function sheetToRows(sheet: import("xlsx").WorkSheet | undefined): InputRow[] {
  if (!sheet || !sheet["!ref"]) return [];
  return sheetToRowsSync(sheet);
}

function sheetToRowsSync(sheet: import("xlsx").WorkSheet): InputRow[] {
  const XLSXref = sheet["!ref"];
  if (!XLSXref) return [];
  // decode without a static xlsx import: local A1 parser is enough for the range
  const range = decodeRange(XLSXref);
  let header = range.s.r;
  const limit = Math.min(range.e.r, range.s.r + 20);
  for (let r = range.s.r; r <= limit; r++) {
    const texts: string[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[encodeCell(r, c)] as SheetCell | undefined;
      if (!cell) continue;
      texts.push(norm(String(cell.w ?? cell.v ?? "")));
    }
    const joined = texts.join(" ");
    if (joined.includes("nombre del anuncio") || joined.includes("ad name") || joined.includes("monto gastado") || joined.includes("amount spent")) {
      header = r;
      break;
    }
  }
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[encodeCell(header, c)] as SheetCell | undefined;
    headers.push(cell ? String(cell.w ?? cell.v ?? "").trim() : "");
  }
  const rows: InputRow[] = [];
  for (let r = header + 1; r <= range.e.r; r++) {
    const row: InputRow = {};
    let any = false;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const h = headers[c - range.s.c];
      if (!h) continue;
      const cell = sheet[encodeCell(r, c)] as SheetCell | undefined;
      if (!cell || cell.v == null || cell.v === "") continue;
      any = true;
      const z = String(cell.z ?? "");
      const w = cell.w != null ? String(cell.w) : "";
      // SheetJS turns "20,5" into 205. The formatted text keeps the decimal comma.
      const value = w && (/,\d/.test(w) || /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(w.trim())) ? w : cell.v;
      row[h] = { v: value, pct: z.includes("%") || w.includes("%") };
    }
    if (any) rows.push(row);
  }
  return rows;
}

function encodeCell(r: number, c: number): string {
  let col = "";
  let n = c + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    n = Math.floor((n - 1) / 26);
  }
  return `${col}${r + 1}`;
}

function decodeRange(ref: string): { s: { r: number; c: number }; e: { r: number; c: number } } {
  const [a, b] = ref.split(":");
  const start = decodeCell(a);
  const end = decodeCell(b || a);
  return { s: start, e: end };
}

function decodeCell(addr: string): { r: number; c: number } {
  const m = addr.match(/^([A-Z]+)(\d+)$/i);
  if (!m) return { r: 0, c: 0 };
  let c = 0;
  for (const ch of m[1].toUpperCase()) c = c * 26 + (ch.charCodeAt(0) - 64);
  return { r: Number(m[2]) - 1, c: c - 1 };
}

export async function filesToSnaps(files: File[]): Promise<{ snaps: Snap[]; notes: string[] }> {
  const snaps: Snap[] = [];
  const notes: string[] = [];
  for (const file of files) {
    if (!/\.(xlsx|xls|csv)$/i.test(file.name) || file.name.startsWith("~$")) continue;
    try {
      const parsed = await bufferToSnaps(await file.arrayBuffer());
      if (!parsed.length) notes.push(`${file.name}: no encontré filas con anuncio y fechas.`);
      snaps.push(...parsed);
    } catch {
      notes.push(`${file.name}: no se pudo leer.`);
    }
  }
  if (!snaps.length && !notes.length) notes.push("No hay archivos .xlsx, .xls o .csv en la selección.");
  return { snaps, notes };
}
