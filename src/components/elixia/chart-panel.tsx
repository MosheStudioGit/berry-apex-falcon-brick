import { useEffect, useRef } from "react";
import clsx from "clsx";
import { formatMetric, formatRange } from "@/lib/elixia/format";
import { CHART_GROUPS, CHART_METRICS, availableMetrics, buildTimeline, toneFor, type ChartKey } from "@/lib/elixia/metrics";
import type { Snap, Tone } from "@/lib/elixia/types";
import { TIP, Tip } from "./help";

const GROUP_TIP = {
  ventas: TIP.evoVentas,
  alcance: TIP.evoAlcance,
  video: TIP.evoVideo,
} as const;

const AXIS: Partial<Record<ChartKey, "y" | "y1">> = {
  gasto: "y",
  resultados: "y1",
  alcance: "y",
  freq: "y1",
  ctr: "y1",
  hook: "y",
  hold: "y",
  avgT: "y1",
};

const AXIS_TITLE: Record<(typeof CHART_GROUPS)[number]["id"], { y: string; y1: string }> = {
  ventas: { y: "Gasto (€)", y1: "Compras" },
  alcance: { y: "Alcance", y1: "Frecuencia y CTR" },
  video: { y: "Porcentaje", y1: "Segundos" },
};

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
  const avail = availableMetrics(history, duration);
  const group = CHART_GROUPS.find((g) => g.keys.includes(metric)) ?? CHART_GROUPS[0];
  const inGroup = group.keys.filter((id) => avail.includes(id));
  const series = inGroup.map((id) => ({ id, def: CHART_METRICS.find((m) => m.id === id)!, timeline: buildTimeline(history, id, duration) }));
  const days = series[0]?.timeline.days ?? [];
  const sig = `${group.id}|${theme}|${skin}|${series.map((s) => `${s.id}:${s.timeline.main.join(",")}:${s.timeline.range.join(",")}`).join(";")}`;

  function openGroup(id: (typeof CHART_GROUPS)[number]["id"]) {
    const next = CHART_GROUPS.find((g) => g.id === id) ?? CHART_GROUPS[0];
    onMetric(next.prefer);
  }

  useEffect(() => {
    const node = canvas.current;
    if (!node || !days.length || !series.length) return;
    let dead = false;
    let chart: { destroy: () => void } | null = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drawn = series;
    const dayLabels = days;
    void (async () => {
      const mod = await import("chart.js/auto");
      const Chart = mod.default;
      if (dead) return;
      ensureCrosshair(Chart as unknown as ChartCtor);
      const styles = getComputedStyle(document.documentElement);
      const ink = styles.getPropertyValue("--muted").trim() || "#655868";
      const accent = styles.getPropertyValue("--accent").trim() || "#00a9a5";
      const gold = styles.getPropertyValue("--gold").trim() || "#e08e04";
      const logo = styles.getPropertyValue("--logo").trim() || "#491b4b";
      const ok = styles.getPropertyValue("--ok").trim() || "#047857";
      const bad = styles.getPropertyValue("--bad").trim() || "#b91c1c";
      const warn = styles.getPropertyValue("--warn").trim() || "#b45309";
      const surface = styles.getPropertyValue("--surface").trim() || "#fff";
      const fg = styles.getPropertyValue("--fg").trim() || "#241428";
      const palette = [accent, gold, logo];
      const labels = dayLabels.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`);
      const datasets: unknown[] = [];
      drawn.forEach((item, index) => {
        const color = palette[index % palette.length];
        const ruled = Boolean(item.def.thresholds);
        datasets.push({
          key: item.id,
          label: item.def.label,
          data: item.timeline.main,
          yAxisID: AXIS[item.id] ?? "y",
          borderColor: color,
          backgroundColor: "transparent",
          tension: 0.25,
          borderWidth: 2.5,
          pointRadius: dayLabels.length > 45 ? 0 : 4,
          pointHoverRadius: 6,
          pointHitRadius: 12,
          pointBackgroundColor: item.timeline.main.map((v) => (ruled ? toneColor(toneFor(item.id, v), color, ok, warn, bad) : color)),
          pointBorderColor: surface,
          pointBorderWidth: 1.5,
          spanGaps: false,
        });
        if (item.timeline.range.some((v) => v != null)) {
          datasets.push({
            key: item.id,
            label: `${item.def.label} · varios días`,
            data: item.timeline.range,
            yAxisID: AXIS[item.id] ?? "y",
            borderColor: color,
            borderDash: [6, 4],
            pointRadius: 0,
            borderWidth: 1.5,
            spanGaps: false,
          });
        }
      });
      const titles = AXIS_TITLE[group.id];
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
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: fg,
              titleColor: surface,
              bodyColor: surface,
              callbacks: {
                label(ctx) {
                  const y = ctx.parsed.y;
                  if (y == null || Number.isNaN(y)) return "";
                  const key = (ctx.dataset as { key?: ChartKey }).key ?? drawn[0].id;
                  return ` ${ctx.dataset.label}: ${formatMetric(key, y)}`;
                },
              },
            },
          },
          scales: {
            x: { ticks: { color: ink, maxRotation: 0, autoSkipPadding: 8 }, grid: { display: false } },
            y: {
              position: "left",
              title: { display: true, text: titles.y, color: ink, font: { size: 11 } },
              ticks: { color: ink },
              grid: { color: colorAlpha(ink, 0.15) },
            },
            y1: {
              position: "right",
              display: drawn.some((item) => (AXIS[item.id] ?? "y") === "y1"),
              title: { display: true, text: titles.y1, color: ink, font: { size: 11 } },
              ticks: { color: ink },
              grid: { drawOnChartArea: false },
            },
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

  const missing = (series[0]?.timeline.missing ?? []).map((d) => formatRange(d, d));

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
                className={clsx("min-h-11 w-full rounded-xl px-2 text-sm font-semibold", on ? "bg-surface text-fg shadow-sm" : "text-muted", empty && !on && "opacity-60")}
              >
                {item.label}
              </button>
            </Tip>
          );
        })}
      </div>
      <div className="relative mt-3 h-72 sm:h-80">
        {inGroup.length && days.length ? (
          <canvas ref={canvas} role="img" aria-label={`Comparación de ${group.label}. La línea vertical sigue el cursor.`} />
        ) : (
          <p className="text-sm text-muted">
            {group.id === "video" ? "Este anuncio no trae reproducciones para ver la calidad del vídeo." : "No hay fechas para esta lectura."}
          </p>
        )}
      </div>
      {missing.length > 0 && <p className="mt-2 text-xs text-muted">Días sin informe, hueco en la gráfica: {missing.join(", ")}.</p>}
    </div>
  );
}

function toneColor(tone: Tone, fallback: string, ok: string, warn: string, bad: string): string {
  if (tone === "g") return ok;
  if (tone === "y") return warn;
  if (tone === "r") return bad;
  return fallback;
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