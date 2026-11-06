export function f2(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function f1(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function fi(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return Math.round(v).toLocaleString("es-ES");
}

export function fm(v: number | null | undefined, suffix = ""): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return f2(v) + suffix;
}

export function formatRange(inicio: string, fin: string): string {
  const short = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;
  return inicio === fin ? short(inicio) : `${short(inicio)} → ${short(fin)}`;
}

export function formatMetric(key: string, v: number): string {
  if (key === "gasto" || key === "cpa") return `${f2(v)} €`;
  if (key === "roas") return `${f2(v)}x`;
  if (key === "freq") return f2(v);
  if (key === "avgT") return `${f2(v)} s`;
  if (key === "alcance" || key === "resultados" || key === "clics") return fi(v);
  if (key === "ctr" || key === "lpv" || key === "hook" || key === "hold" || key === "cr" || key === "dropoff" || key === "intent" || key === "watch") {
    return `${f2(v)}%`;
  }
  return f2(v);
}
