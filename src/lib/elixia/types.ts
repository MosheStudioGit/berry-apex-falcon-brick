export type RoasOrigin = "column" | "value" | "none";

export type Snap = {
  ad: string;
  campaign: string;
  inicio: string;
  fin: string;
  activo: boolean;
  gasto: number;
  resultados: number;
  cpa: number | null;
  roas: number | null;
  roasAdjusted: boolean;
  roasOrigin: RoasOrigin;
  purchaseValue: number | null;
  freq: number | null;
  ctr: number | null;
  lpv: number | null;
  impr: number;
  clics: number;
  alcance: number | null;
  plays: number | null;
  v3s: number | null;
  p50: number | null;
  p75: number | null;
  p95: number | null;
  p100: number | null;
  thru: number | null;
  vis: number | null;
  avgT: number | null;
  duration: number | null;
  atc: number | null;
  ic: number | null;
  reactions: number | null;
  quality: string | null;
  convRank: string | null;
  created: string | null;
  demo?: boolean;
};

export type Tone = "g" | "y" | "r" | "n";

export type RetentionSource = "50%" | "100%" | "95%" | "ThruPlay" | "75%" | null;

export type View = Snap & {
  retained: number | null;
  retentionSource: RetentionSource;
  hook: number | null;
  hold: number | null;
  visUse: number | null;
  dropoff: number | null;
  cr: number | null;
  intent: number | null;
  payRate: number | null;
  watch: number | null;
  dur: number | null;
};

export type Agg = {
  n: number;
  skipped: number;
  gasto: number;
  resultados: number;
  cpa: number | null;
  roas: number | null;
  freq: number | null;
  ctr: number | null;
  lpv: number | null;
  hook: number | null;
  hold: number | null;
  hold50: number | null;
  hold75: number | null;
  complete: number | null;
  avgT: number | null;
  watch: number | null;
  alcance: number | null;
  impr: number;
  clics: number;
  vis: number | null;
  atc: number | null;
  ic: number | null;
  dropoff: number | null;
  cr: number | null;
  intent: number | null;
  payRate: number | null;
  roasAdjusted: boolean;
  roasFromValue: boolean;
  retentionNote: string;
};

export type VerdictKey = "low" | "esc" | "var" | "apa" | "vig";

export type AdSummary = {
  ad: string;
  campaign: string;
  history: Snap[];
  latest: Snap;
  agg: Agg;
};
