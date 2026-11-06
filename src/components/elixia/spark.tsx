export function Spark({ values, higher }: { values: (number | null)[]; higher?: boolean }) {
  const valid = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (valid.length < 2) {
    return <p className="flex h-8 items-center text-xs text-muted">Datos insuficientes</p>;
  }
  const w = 200;
  const h = 32;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      if (v == null || !Number.isFinite(v)) return null;
      const x = (i / (values.length - 1)) * (w - 8) + 4;
      const y = h - 4 - ((v - min) / range) * (h - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean);
  const rising = valid[valid.length - 1] >= valid[0];
  const color = higher == null ? "var(--accent)" : higher === rising ? "var(--ok)" : "var(--bad)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts.join(" ")} />
    </svg>
  );
}
