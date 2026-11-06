import { useEffect, useRef } from "react";
import clsx from "clsx";
import { formatMetric, formatRange } from "@/lib/elixia/format";
import { CHART_GROUPS, CHART_METRICS, availableMetrics, buildTimeline, type ChartKey } from "@/lib/elixia/metrics";
import type { Snap } from "@/lib/elixia/types";
import { TIP, Tip } from "./help";

const SERIES_TIP: Partial<Record<ChartKey, string>> = {
  roas: TIP.roas,
  cpa: TIP.cpa,
  ctr: TIP.ctr,
  freq: TIP.freq,
  lpv: TIP.lpv,
  hook: TIP.hook,
  hold: TIP.hold,
  avgT: TIP.avgT,
  gasto: TIP.gasto,
  resultados: TIP.compras,
  alcance: TIP.alcance,
  cr: TIP.cr,
  dropoff: TIP.dropoff,
  intent: TIP.intent,
};

const GROUP_TIP = {
  ventas: TIP.evoVentas,
  alcance: TIP.evoAlcance,
  video: TIP.evoVideo,
} as const;

type Props = {
  history: Snap[];
  metric: ChartKey;
  onMetric: (m: ChartKey) => void;
  duration?: number | null;
  theme: "light" | "dark";
  skin: string;
};

export function ChartPanel({ history, metric, onMetric, duration, theme, skin }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const memory = useRef<Partial<Record<(typeof CHART_GROUPS)[number]["id"], ChartKey>>>({});
  const avail = availableMetrics(history, duration);
  const group = CHART_GROUPS.find((g) => g.keys.includes(metric)) ?? CHART_GROUPS[0];
  const inGroup = group.keys.filter((id) => avail.includes(id));
  const active = inGroup.includes(metric) ? metric : (inGroup[0] ?? group.prefer);
  memory.current[group.id] = active;
  const def = CHART_METRICS.find((m) => m.id === active) ?? CHART_METRICS[0];
  const timeline = buildTimeline(history, active, duration);
  const sig = `${active}|${theme}|${skin}|${inGroup.join(",")}|${timeline.days.join(",")}|${timeline.main.join(",")}|${timeline.range.join(",")}`;

  function openGroup(id: (typeof CHART_GROUPS)[number]["id"]) {
    const next = CHART_GROUPS.find((g) => g.id === id) ?? CHART_GROUPS[0];
    const keys = next.keys.filter((key) => avail.includes(key));
    const remembered = memory.current[next.id];
    const pick = remembered && keys.includes(remembered) ? remembered : keys.includes(next.prefer) ? next.prefer : (keys[0] ?? next.prefer);
    onMetric(pick);
  }

  useEffect(() => {
    const node = canvas.current;
    if (!node || !timeline.days.length) return;
    let dead = false;
    let chart: { destroy: () => void } | null = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void (async () => {
      const mod = await import("chart.js/auto");
      const Chart = mod.default;
      if (dead) return;
      ensureCrosshair(Chart as unknown as ChartCtor);
      const styles = getComputedStyle(document.documentElement);
      const ink = styles.getPropertyValue("--muted").trim() || "#655868";
      const accent = styles.getPropertyValue("--accent").trim() || "#00a9a5";
      const gold = styles.getPropertyValue("--gold").trim() || "#e08e04";
      const ok = styles.getPropertyValue("--ok").trim() || "#047857";
      const bad = styles.getPropertyValue("--bad").trim() || "#b91c1c";
      const warn = styles.getPropertyValue("--warn").trim() || "#b45309";
      const surface = styles.getPropertyValue("--surface").trim() || "#fff";
      const fg = styles.getPropertyValue("--fg").trim() || "#241428";
      const labels = timeline.days.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`);
      const datasets: unknown[] = [
        {
          label: def.label,
          data: timeline.main,
          borderColor: accent,
          backgroundColor: colorAlpha(accent, 0.14),
          fill: true,
          tension: 0.25,
          borderWidth: 2.5,
          pointRadius: timeline.days.length > 45 ? 0 : 3,
          pointHoverRadius: 5,
          pointHitRadius: 12,
          spanGaps: false,
        },
      ];
      if (timeline.range.some((v) => v != null)) {
        datasets.push({
          label: additive(active) ? "Promedio diario del informe de rango" : "Valor del informe de rango",
          data: timeline.range,
          borderColor: gold,
          borderDash: [6, 4],
          pointRadius: 2,
          borderWidth: 2,
          spanGaps: false,
          fill: false,
        });
      }
      if (def.thresholds) {
        const colors = def.hi ? [warn, ok] : [ok, bad];
        def.thresholds.forEach((v, i) => {
          datasets.push({
            label: `Umbral ${v}`,
            data: timeline.days.map(() => v),
            borderColor: colors[i],
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 1,
            fill: false,
          });
        });
      }
      const instance = new Chart(node, {
        type: "line",
        data: { labels, datasets: datasets as never },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: reduce ? false : { duration: 360 },
          interaction: { mode: "index", intersect: false },
          hover: { mode: "index", intersect: false },
          plugins: {
            legend: {
              labels: {
                color: ink,
                boxWidth: 10,
                font: { size: 11, family: "Plus Jakarta Sans, sans-serif" },
                filter: (item) => !String(item.text).startsWith("Umbral"),
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: fg,
              titleColor: surface,
              bodyColor: surface,
              filter: (item) => !String(item.dataset.label ?? "").startsWith("Umbral"),
              callbacks: {
                label(ctx) {
                  const y = ctx.parsed.y;
                  if (y == null || Number.isNaN(y)) return "";
                  return ` ${ctx.dataset.label}: ${formatMetric(active, y)}`;
                },
              },
            },
          },
          scales: {
            x: { ticks: { color: ink, maxRotation: 0, autoSkipPadding: 8 }, grid: { display: false } },
            y: { ticks: { color: ink }, grid: { color: colorAlpha(ink, 0.15) } },
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
    // sig captures the series; timeline identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const missing = timeline.missing.map((d) => formatRange(d, d));

  return (
    <div>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-soft p-1" role="tablist" aria-label="Tema de la evolución">
        {CHART_GROUPS.map((item) => {
          const on = item.id === group.id;
          const empty = item.keys.every((key) => !avail.includes(key));
          return (
            <Tip key={item.id} text={GROUP_TIP[item.id]} block className="min-w-0">
              <button
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => openGroup(item.id)}
                className={clsx(
                  "min-h-11 w-full rounded-xl px-2 text-sm font-semibold",
                  on ? "bg-surface text-fg shadow-sm" : "text-muted",
                  empty && !on && "opacity-60",
                )}
              >
                {item.label}
              </button>
            </Tip>
          );
        })}
      </div>
      {inGroup.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={group.label}>
          {inGroup.map((id) => {
            const item = CHART_METRICS.find((m) => m.id === id);
            const on = id === active;
            return (
              <Tip key={id} text={SERIES_TIP[id] ?? item?.label ?? id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onMetric(id)}
                  className={clsx(
                    "min-h-11 rounded-full px-3 text-sm font-semibold",
                    on ? "bg-logo text-on-logo" : "border border-line bg-surface text-muted",
                  )}
                >
                  {item?.label ?? id}
                </button>
              </Tip>
            );
          })}
        </div>
      )}
      <div className="relative mt-3 h-72 sm:h-80">
        {inGroup.length && timeline.days.length ? (
          <canvas ref={canvas} role="img" aria-label={`Evolución de ${def.label}. La línea vertical sigue el cursor.`} />
        ) : (
          <p className="text-sm text-muted">
            {group.id === "video" ? "Este anuncio no trae reproducciones para ver la calidad del vídeo." : "No hay fechas para esta lectura."}
          </p>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">
        {missing.length ? `Días sin informe, hueco en la gráfica: ${missing.join(", ")}.` : inGroup.length ? "Cada día del rango tiene informe o queda cubierto por uno de varios días." : ""}
      </p>
    </div>
  );
}

function additive(key: ChartKey): boolean {
  return key === "gasto" || key === "resultados" || key === "alcance";
}

function colorAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return hex;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type ChartCtor = {
  register: (plugin: { id: string; afterDraw: (chart: CrossChart) => void }) => void;
  new (node: HTMLCanvasElement, config: unknown): { destroy: () => void };
};

type CrossChart = {
  chartArea?: { top: number; bottom: number };
  ctx: CanvasRenderingContext2D;
  getActiveElements: () => { element: { x: number } }[];
};

let pluginReady = false;

function ensureCrosshair(Chart: ChartCtor) {
  if (pluginReady) return;
  Chart.register({
    id: "elixiaCrosshair",
    afterDraw(chart) {
      const active = chart.getActiveElements();
      if (!active.length || !chart.chartArea) return;
      const x = active[0].element.x;
      const ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#655868";
      ctx.moveTo(x, chart.chartArea.top);
      ctx.lineTo(x, chart.chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    },
  });
  pluginReady = true;
}
