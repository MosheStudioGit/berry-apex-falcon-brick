import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { f2, fi } from "@/lib/elixia/format";
import type { Snap } from "@/lib/elixia/types";
import { HelpMark, TIP, Tip } from "./help";

const PALETTE = ["var(--logo)", "var(--accent)", "var(--gold)", "var(--brand)", "var(--ok)", "var(--warn)", "var(--bad)", "var(--accent-ink)"];

type Item = { ad: string; gasto: number; history: Snap[] };

export function SpendMix({ items, theme, skin }: { items: Item[]; theme: "light" | "dark"; skin: string }) {
  const ranked = items.filter((s) => s.gasto > 0).slice().sort((a, b) => b.gasto - a.gasto);
  const total = ranked.reduce((a, s) => a + s.gasto, 0) || 1;
  const [selected, setSelected] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const current = ranked.find((s) => s.ad === selected) ?? null;

  function pick(ad: string) {
    setSelected((cur) => (cur === ad ? null : ad));
    setTip(null);
  }

  return (
    <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
      <Tip text={TIP.gastoMix}>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted uppercase">
          Dónde se va el gasto
          <HelpMark />
        </p>
      </Tip>
      {ranked.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Todavía no hay gasto que repartir.</p>
      ) : (
        <div className="mt-3 grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {ranked.map((s, i) => {
              const on = s.ad === selected;
              const share = (s.gasto / total) * 100;
              return (
                <li key={s.ad}>
                  <button
                    type="button"
                    onClick={() => pick(s.ad)}
                    className={clsx("flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-sm", on ? "bg-accent/15" : "hover:bg-soft")}
                  >
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{s.ad}</span>
                    <span className="font-mono text-xs tabular-nums text-muted">
                      {f2(s.gasto)} € · {f2(share)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Donut
            parts={ranked.map((s, i) => ({ ad: s.ad, gasto: s.gasto, color: PALETTE[i % PALETTE.length] }))}
            total={total}
            selected={selected}
            onPick={pick}
            onTip={setTip}
          />
        </div>
      )}
      {tip && (
        <p className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg bg-logo px-2 py-1 text-xs font-medium text-on-logo shadow-sm" style={{ left: tip.x, top: tip.y - 8 }}>
          {tip.text}
        </p>
      )}
      {current && <DailyLine ad={current.ad} history={current.history} theme={theme} skin={skin} />}
    </div>
  );
}

function Donut({
  parts,
  total,
  selected,
  onPick,
  onTip,
}: {
  parts: { ad: string; gasto: number; color: string }[];
  total: number;
  selected: string | null;
  onPick: (ad: string) => void;
  onTip: (tip: { x: number; y: number; text: string } | null) => void;
}) {
  const r = 68;
  const c = 2 * Math.PI * r;
  let cursor = 0;
  const arcs = parts.map((p) => {
    const len = (p.gasto / total) * c;
    const gap = len > 3 ? 1.5 : 0;
    const arc = { ...p, dash: Math.max(len - gap, 0), offset: c - cursor };
    cursor += len;
    return arc;
  });
  return (
    <svg viewBox="0 0 180 180" className="mx-auto size-52" role="img" aria-label="Reparto del gasto">
      <g transform="rotate(-90 90 90)">
        {arcs.map((a) => (
          <circle
            key={a.ad}
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={selected && selected !== a.ad ? 16 : 24}
            strokeDasharray={`${a.dash} ${c}`}
            strokeDashoffset={a.offset}
            opacity={selected && selected !== a.ad ? 0.35 : 1}
            className="cursor-pointer"
            onClick={() => onPick(a.ad)}
            onMouseMove={(e) => onTip({ x: e.clientX, y: e.clientY, text: `${a.ad}: ${f2(a.gasto)} € · ${f2((a.gasto / total) * 100)}%` })}
            onMouseLeave={() => onTip(null)}
          />
        ))}
      </g>
      <text x="90" y="86" textAnchor="middle" className="fill-fg text-[11px] font-semibold">
        Gasto
      </text>
      <text x="90" y="104" textAnchor="middle" className="fill-fg font-mono text-[13px] font-bold">
        {f2(total)} €
      </text>
    </svg>
  );
}

function dailyRows(history: Snap[]) {
  const days = history.filter((s) => s.inicio === s.fin).sort((a, b) => a.fin.localeCompare(b.fin));
  const base = days.length >= 2 ? days : [...history].sort((a, b) => a.fin.localeCompare(b.fin));
  return base.map((s) => ({ day: s.fin.slice(8) + "/" + s.fin.slice(5, 7), gasto: s.gasto, impr: s.impr, compras: s.resultados }));
}

function DailyLine({ ad, history, theme, skin }: { ad: string; history: Snap[]; theme: string; skin: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rows = useMemo(() => dailyRows(history), [history]);
  const sig = `${ad}|${theme}|${skin}|${rows.map((r) => r.gasto).join(",")}`;

  useEffect(() => {
    const node = canvas.current;
    if (!node || rows.length < 1) return;
    let dead = false;
    let chart: { destroy: () => void } | null = null;
    void (async () => {
      const mod = await import("chart.js/auto");
      if (dead) return;
      const Chart = mod.default;
      const styles = getComputedStyle(document.documentElement);
      const ink = styles.getPropertyValue("--muted").trim() || "#655868";
      const accent = styles.getPropertyValue("--accent").trim() || "#00a9a5";
      const gold = styles.getPropertyValue("--gold").trim() || "#e08e04";
      const fg = styles.getPropertyValue("--fg").trim() || "#241428";
      const surface = styles.getPropertyValue("--surface").trim() || "#fff";
      const instance = new Chart(node, {
        type: "line",
        data: {
          labels: rows.map((r) => r.day),
          datasets: [
            { label: "Gasto €", data: rows.map((r) => r.gasto), borderColor: accent, tension: skin === "trade" ? 0 : 0.25, borderWidth: 2, pointRadius: 3, yAxisID: "y" },
            { label: "Impresiones", data: rows.map((r) => r.impr), borderColor: ink, borderDash: [4, 3], tension: skin === "trade" ? 0 : 0.25, borderWidth: 1.5, pointRadius: 0, yAxisID: "y1" },
            { label: "Compras", data: rows.map((r) => r.compras), borderColor: gold, tension: skin === "trade" ? 0 : 0.25, borderWidth: 2, pointRadius: 3, yAxisID: "y2" },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { labels: { color: ink, boxWidth: 10, font: { size: 11 } } },
            tooltip: {
              backgroundColor: fg,
              titleColor: surface,
              bodyColor: surface,
              callbacks: {
                label(ctx) {
                  const y = ctx.parsed.y;
                  if (y == null) return "";
                  if (ctx.dataset.label === "Gasto €") return ` Gasto: ${f2(y)} €`;
                  if (ctx.dataset.label === "Compras") return ` Compras: ${fi(y)}`;
                  return ` Impresiones: ${fi(y)}`;
                },
              },
            },
          },
          scales: {
            x: { ticks: { color: ink, maxRotation: 0 }, grid: { display: false } },
            y: { position: "left", ticks: { color: ink }, grid: { color: skin === "trade" ? ink : "transparent" } },
            y1: { position: "right", display: false },
            y2: { display: false },
          },
        },
      });
      if (dead) instance.destroy();
      else chart = instance;
    })();
    return () => {
      dead = true;
      chart?.destroy();
    };
  }, [sig, rows]);

  return (
    <div className="mt-4 border-t border-line pt-3">
      <p className="text-sm font-bold">{ad}</p>
      {skin === "trade" && <Candles rows={rows} />}
      <div className="relative mt-2 h-56">
        <canvas ref={canvas} role="img" aria-label={`Evolución diaria de ${ad}`} />
      </div>
    </div>
  );
}

function Candles({ rows }: { rows: { gasto: number }[] }) {
  if (rows.length < 2) return null;
  const vals = rows.map((r) => r.gasto);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const span = max - min || 1;
  const width = rows.length * 14;
  return (
    <div className="mt-2">
      <p className="font-mono text-[10px] tracking-widest text-muted uppercase">Velas de gasto</p>
      <svg viewBox={`0 0 ${width} 64`} className="mt-1 h-16 w-full" aria-hidden>
        {rows.map((r, i) => {
          const prev = i === 0 ? r.gasto : rows[i - 1].gasto;
          const up = r.gasto >= prev;
          const yOpen = 58 - ((prev - min) / span) * 50;
          const yClose = 58 - ((r.gasto - min) / span) * 50;
          const top = Math.min(yOpen, yClose);
          const body = Math.max(3, Math.abs(yClose - yOpen));
          const x = i * 14 + 7;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={top - 5} y2={top + body + 5} stroke={up ? "var(--ok)" : "var(--bad)"} strokeWidth="1" />
              <rect x={x - 3} y={top} width="6" height={body} fill={up ? "var(--ok)" : "var(--bad)"} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
