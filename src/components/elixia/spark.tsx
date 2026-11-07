import { useState } from "react";
import { createPortal } from "react-dom";
import type { Tone } from "@/lib/elixia/types";

const TONE_COLOR: Record<Tone, string> = {
  g: "var(--ok)",
  y: "var(--warn)",
  r: "var(--bad)",
  n: "var(--accent)",
};

export function Spark({
  points,
  tone,
  mark,
  format,
}: {
  points: { label: string; value: number | null }[];
  tone: Tone;
  mark?: number;
  format: (n: number) => string;
}) {
  const [hot, setHot] = useState<{ i: number; x: number; y: number } | null>(null);
  const valid = points.map((p) => p.value).filter((v): v is number => v != null && Number.isFinite(v));
  if (valid.length < 2) {
    return <p className="flex h-8 items-center text-xs text-muted">Datos insuficientes</p>;
  }
  const w = 200;
  const h = 32;
  const scale = mark == null ? valid : [...valid, mark];
  const min = Math.min(...scale);
  const max = Math.max(...scale);
  const range = max - min || 1;
  const yOf = (value: number) => h - 4 - ((value - min) / range) * (h - 8);
  const coords = points.map((p, i) => {
    if (p.value == null || !Number.isFinite(p.value)) return null;
    const x = (i / (points.length - 1)) * (w - 8) + 4;
    return { x, y: yOf(p.value), i };
  });
  const drawn = coords.filter((c): c is { x: number; y: number; i: number } => c != null);
  const color = TONE_COLOR[tone];
  const tip = hot == null ? null : points[hot.i];
  const markY = mark == null ? null : yOf(mark);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-8 w-full"
        role="img"
        aria-label="Tendencia respecto a su semáforo. Pasa el cursor para ver la fecha y el valor."
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
        {markY != null && <line x1="4" x2={w - 4} y1={markY} y2={markY} stroke="var(--muted)" strokeDasharray="3 3" strokeWidth="1" />}
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