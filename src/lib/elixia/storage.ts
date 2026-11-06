import type { Snap } from "./types.ts";

const SNAPS = "elixia_meta_snaps_v4";
const DURS = "elixia_durations_v1";
const THEME = "elixia_theme";
const SKIP = "elixia_skip_demo";

function isSnap(x: unknown): x is Snap {
  if (!x || typeof x !== "object") return false;
  const s = x as Partial<Snap>;
  return typeof s.ad === "string" && typeof s.inicio === "string" && typeof s.fin === "string" && typeof s.gasto === "number";
}

export function loadState(): {
  snaps: Snap[];
  durations: Record<string, number>;
  theme: "light" | "dark";
  skipDemo: boolean;
} {
  let snaps: Snap[] = [];
  let durations: Record<string, number> = {};
  let theme: "light" | "dark" = "light";
  let skipDemo = false;
  try {
    const raw = JSON.parse(localStorage.getItem(SNAPS) || "null") as unknown;
    if (Array.isArray(raw)) snaps = raw.filter(isSnap);
    const d = JSON.parse(localStorage.getItem(DURS) || "null") as unknown;
    if (d && typeof d === "object") {
      for (const [k, v] of Object.entries(d)) {
        if (typeof v === "number" && v > 0) durations[k] = v;
      }
    }
    const t = localStorage.getItem(THEME);
    if (t === "dark" || t === "light") theme = t;
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) theme = "dark";
    skipDemo = localStorage.getItem(SKIP) === "1";
  } catch {
    /* storage corrupto: se empieza de cero */
  }
  return { snaps, durations, theme, skipDemo };
}

export function saveSnaps(snaps: Snap[]) {
  localStorage.setItem(SNAPS, JSON.stringify(snaps));
}

export function saveDurations(durations: Record<string, number>) {
  localStorage.setItem(DURS, JSON.stringify(durations));
}

export function saveTheme(theme: "light" | "dark") {
  localStorage.setItem(THEME, theme);
}

export function setSkipDemo(skip: boolean) {
  if (skip) localStorage.setItem(SKIP, "1");
  else localStorage.removeItem(SKIP);
}

export function snapId(s: Snap): string {
  let h = 5381;
  const key = s.ad;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
  return `${s.fin}|${s.inicio}|${h.toString(36)}`;
}

export function mergeSnaps(prev: Snap[], incoming: Snap[]): { next: Snap[]; nuevos: number; actualizados: number } {
  const map = new Map(prev.filter((s) => !s.demo).map((s) => [snapId(s), s]));
  let nuevos = 0;
  let actualizados = 0;
  for (const s of incoming) {
    const id = snapId(s);
    if (map.has(id)) actualizados += 1;
    else nuevos += 1;
    map.set(id, { ...s, demo: false });
  }
  return { next: [...map.values()], nuevos, actualizados };
}

export function toCsv(snaps: Snap[]): string {
  const head = [
    "anuncio",
    "campana",
    "inicio",
    "fin",
    "activo",
    "gasto",
    "compras",
    "cpa",
    "roas",
    "roas_origen",
    "valor_compras",
    "frecuencia",
    "ctr_enlace",
    "carga_lpv",
    "hook",
    "vis_3s",
    "retencion_final",
    "tiempo_medio",
    "duracion",
    "impresiones",
    "clics",
    "visitas",
    "alcance",
    "anadidos_carrito",
    "inicios_pago",
    "ejemplo",
  ];
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const n = (v: number | null) => (v == null ? "" : String(Math.round(v * 10000) / 10000));
  const lines = snaps
    .filter((s) => s.ad)
    .sort((a, b) => a.ad.localeCompare(b.ad, "es") || a.fin.localeCompare(b.fin))
    .map((s) =>
      [
        q(s.ad),
        q(s.campaign),
        s.inicio,
        s.fin,
        s.activo ? "1" : "0",
        n(s.gasto),
        s.resultados,
        n(s.cpa),
        n(s.roas),
        s.roasOrigin,
        n(s.purchaseValue),
        n(s.freq),
        n(s.ctr),
        n(s.lpv),
        n(s.v3s != null && s.impr ? (s.v3s / s.impr) * 100 : null),
        n(s.v3s),
        n(s.p100 ?? s.p95 ?? s.thru ?? s.p75),
        n(s.avgT),
        n(s.duration),
        s.impr,
        s.clics,
        n(s.vis),
        n(s.alcance),
        n(s.atc),
        n(s.ic),
        s.demo ? "1" : "0",
      ].join(","),
    );
  return `\uFEFF${head.join(",")}\n${lines.join("\n")}`;
}
