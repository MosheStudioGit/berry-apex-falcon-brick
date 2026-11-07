import type { Snap } from "./types.ts";

function iso(day: number): string {
  return new Date(Date.UTC(2026, 9, 22 + day)).toISOString().slice(0, 10);
}

function wob(base: number, day: number, amp: number, seed: number): number {
  return base + Math.sin(day * 1.35 + seed) * amp;
}

function make(p: {
  ad: string;
  campaign: string;
  day: number;
  activo: boolean;
  gasto: number;
  resultados: number;
  roas: number;
  freq: number;
  ctr: number;
  load: number;
  impr: number;
  hook: number | null;
  hold: number | null;
  avgT: number | null;
  duration: number | null;
  atc: number | null;
  ic: number | null;
}): Snap {
  const clics = Math.max(0, Math.round((p.impr * p.ctr) / 100));
  const vis = Math.round(clics * p.load);
  const v3s = p.hook == null ? null : Math.round(p.impr * (p.hook / 100));
  const retained = v3s == null || p.hold == null ? null : Math.round(v3s * (p.hold / 100));
  const date = iso(p.day);
  return {
    ad: p.ad,
    campaign: p.campaign,
    inicio: date,
    fin: date,
    activo: p.activo,
    gasto: Math.round(p.gasto * 100) / 100,
    resultados: p.resultados,
    cpa: p.resultados > 0 ? p.gasto / p.resultados : null,
    roas: p.roas,
    roasAdjusted: false,
    roasOrigin: "column",
    purchaseValue: Math.round(p.gasto * p.roas * 100) / 100,
    freq: Math.round(p.freq * 100) / 100,
    ctr: Math.round(p.ctr * 100) / 100,
    lpv: Math.round(p.load * 1000) / 10,
    impr: p.impr,
    clics,
    alcance: Math.round(p.impr / Math.max(p.freq, 0.2)),
    plays: v3s,
    v3s,
    p50: null,
    p75: null,
    p95: null,
    p100: retained,
    thru: null,
    vis,
    avgT: p.avgT,
    duration: p.duration,
    atc: p.atc,
    ic: p.ic,
    reactions: null,
    quality: null,
    convRank: null,
    created: null,
    demo: true,
  };
}

/** Cuatro anuncios con historias distintas para recorrer los tres bloques sin un Excel. */
export function buildDemo(): Snap[] {
  const days = Array.from({ length: 12 }, (_, i) => i);
  const out: Snap[] = [];
  for (const day of days) {
    if (day !== 5) {
      const compras = Math.max(1, Math.round(wob(2, day, 0.55, 1)));
      const cpa = wob(8.4, day, 0.35, 2);
      out.push(
        make({
          ad: "UGC Unboxing — Oferta 29€",
          campaign: "Prospecting · Escala",
          day,
          activo: true,
          gasto: compras * cpa,
          resultados: compras,
          roas: wob(3.15, day, 0.18, 3),
          freq: wob(1.22, day, 0.06, 0.4),
          ctr: wob(3.05, day, 0.2, 1.2),
          load: 0.91,
          impr: Math.round(wob(3200, day, 280, 0.2)),
          hook: wob(36, day, 3, 0.8),
          hold: wob(42, day, 4, 1.1),
          avgT: wob(6.4, day, 0.4, 0.3),
          duration: 15,
          atc: compras * 3,
          ic: compras * 2,
        }),
      );
    }
    out.push(
      make({
        ad: "Testimonio COD — 2,99€",
        campaign: "Retargeting · Checkout",
        day,
        activo: true,
        gasto: wob(18, day, 1.4, 0.6),
        resultados: 1,
        roas: wob(1.12, day, 0.08, 1.4),
        freq: wob(1.34, day, 0.05, 0.2),
        ctr: wob(3.35, day, 0.18, 0.9),
        load: 0.9,
        impr: Math.round(wob(4100, day, 300, 1)),
        hook: wob(33, day, 2, 0.5),
        hold: wob(28, day, 3, 1.6),
        avgT: wob(4.2, day, 0.3, 0.7),
        duration: 20,
        atc: 8 + (day % 3),
        ic: 7 + (day % 2),
      }),
    );
    out.push(
      make({
        ad: "Carrusel beneficios — fatiga",
        campaign: "Always on",
        day,
        activo: true,
        gasto: wob(6.2, day, 0.4, 0.3),
        resultados: 0,
        roas: 0,
        freq: 1.86 + day * 0.05,
        ctr: wob(1.05, day, 0.12, 2),
        load: 0.82,
        impr: Math.round(wob(2600, day, 200, 0.4)),
        hook: wob(14, day, 2, 1.3),
        hold: wob(11, day, 2, 0.9),
        avgT: wob(2.1, day, 0.25, 1.8),
        duration: 12,
        atc: null,
        ic: null,
      }),
    );
    out.push(
      make({
        ad: "Estático precio — landing lenta",
        campaign: "Prospecting · Broad",
        day,
        activo: false,
        gasto: wob(14.6, day, 0.8, 1.7),
        resultados: 1,
        roas: wob(1.28, day, 0.1, 2.2),
        freq: wob(1.28, day, 0.05, 0.1),
        ctr: wob(2.72, day, 0.12, 0.6),
        load: 0.55,
        impr: Math.round(wob(2400, day, 180, 1.5)),
        hook: null,
        hold: null,
        avgT: null,
        duration: null,
        atc: 3,
        ic: 2,
      }),
    );
  }
  return out;
}
