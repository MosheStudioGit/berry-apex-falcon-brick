import { useState } from "react";
import { createPortal } from "react-dom";

export function Spark({
  points,
  higher,
  format,
}: {
  points: { label: string; value: number | null }[];
  higher?: boolean;
  format: (n: number) => string;
}) {
  const [hot, setHot] = useState<{ i: number; x: number; y: number } | null>(null);
  const valid = points.map((p) => p.value).filter((v): v is number => v != null && Number.isFinite(v));
  if (valid.length < 2) {
    return <p className="flex h-8 items-center text-xs text-muted">Datos insuficientes</p>;
  }
  const w = 200;
  const h = 32;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    if (p.value == null || !Number.isFinite(p.value)) return null;
    const x = (i / (points.length - 1)) * (w - 8) + 4;
    const y = h - 4 - ((p.value - min) / range) * (h - 8);
    return { x, y, i };
  });
  const drawn = coords.filter((c): c is { x: number; y: number; i: number } => c != null);
  const rising = valid[valid.length - 1] >= valid[0];
  const color = higher == null ? "var(--accent)" : higher === rising ? "var(--ok)" : "var(--bad)";
  const tip = hot == null ? null : points[hot.i];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-8 w-full"
        role="img"
        aria-label="Tendencia. Pasa el cursor para ver la fecha y el valor."
        onMouseLeave={() => setHot(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * w;
          let best = drawn[0];
          let dist = Infinity;
          for (const c of drawn) {
            const d = Math.abs(c.x - x);
            if (d < dist) {
              dist = d;
              best = c;
            }
          }
          setHot(best ? { i: best.i, x: e.clientX, y: e.clientY } : null);
        }}
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={drawn.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")}
        />
        {drawn.map((c) => (
          <circle key={c.i} cx={c.x} cy={c.y} r={hot?.i === c.i ? 3.5 : 0} fill={color} />
        ))}
      </svg>
      {tip && tip.value != null && hot && typeof document !== "undefined"
        ? createPortal(
            <p
              role="tooltip"
              className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg bg-logo px-2 py-1 text-xs font-medium whitespace-nowrap text-on-logo shadow-sm"
              style={{ left: hot.x, top: hot.y - 10 }}
            >
              {tip.label} · {format(tip.value)}
            </p>,
            document.body,
          )
        : null}
    </div>
  );
}
