import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  Eye,
  FlaskConical,
  FolderOpen,
  Hourglass,
  Moon,
  Power,
  RefreshCw,
  Search,
  Sparkles,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import clsx from "clsx";
import { buildDemo } from "@/lib/elixia/demo";
import { f2, fi, fm, formatMetric, formatRange } from "@/lib/elixia/format";
import {
  CHART_GROUPS,
  CHART_METRICS,
  LEGEND,
  SPARK_KEYS,
  accountOf,
  aggregate,
  crRead,
  div,
  dropoffRead,
  getVerdict,
  intentRead,
  siteDiagnosis,
  sparkPoints,
  summarize,
  toneFor,
  creativeSignals,
  rankTone,
  type ChartKey,
} from "@/lib/elixia/metrics";
import { filesToSnaps, isGhostAd } from "@/lib/elixia/parse";
import { loadState, mergeSnaps, saveDurations, saveSnaps, saveTheme, setSkipDemo } from "@/lib/elixia/storage";
import { downloadCsv, downloadStandalone, downloadXlsx, printPdf } from "@/lib/elixia/export-report";
import { DEFAULT_BRAND, loadBrand, loadSkin, saveBrand, saveSkin, type Brand, type SkinId } from "@/lib/elixia/appearance";
import type { Agg, Snap, Tone, VerdictKey } from "@/lib/elixia/types";
import { ChartPanel } from "./chart-panel";
import { AppearancePanel } from "./appearance-panel";
import { Spark } from "./spark";
import { SpendMix } from "./spend-mix";
import { HelpMark, HelpProvider, HelpSwitch, TIP, Tip } from "./help";

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold";
const btnLogo = clsx(btn, "bg-logo text-on-logo");
const btnGhost = clsx(btn, "border border-line bg-surface text-fg");

export function Dashboard() {
  return (
    <HelpProvider>
      <Live />
    </HelpProvider>
  );
}

function Live() {
  const [snaps, setSnaps] = useState<Snap[]>(() => buildDemo());
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [skin, setSkin] = useState<SkinId>("elixia");
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND);
  const [lookOpen, setLookOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [metric, setMetric] = useState<ChartKey>("gasto");
  const [importOpen, setImportOpen] = useState(false);
  const [scope, setScope] = useState<"ad" | "account">("ad");
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const dirRef = useRef<DirHandle | null>(null);

  useEffect(() => {
    const boot = loadState();
    if (boot.snaps.length) setSnaps(boot.snaps.filter((s) => !isGhostAd(s.ad)));
    else if (boot.skipDemo) setSnaps([]);
    setDurations(boot.durations);
    setTheme(boot.theme);
    setSkin(loadSkin());
    setBrand(loadBrand());
    setImportOpen(boot.snaps.length === 0 && boot.skipDemo);
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.skin = skin;
    document.title = brand.name.trim() || DEFAULT_BRAND.name;
    saveTheme(theme);
    saveSkin(skin);
    try {
      saveBrand(brand);
    } catch {
      setBanner({ kind: "err", text: "El logo no cabe en el navegador. Prueba otra imagen." });
    }
  }, [theme, skin, brand, booted]);

  useEffect(() => {
    if (!booted) return;
    try {
      saveSnaps(snaps);
    } catch {
      setBanner({ kind: "err", text: "El navegador no tiene espacio para guardar más informes. Exporta un CSV y borra los antiguos." });
    }
  }, [snaps, booted]);

  useEffect(() => {
    if (booted) saveDurations(durations);
  }, [durations, booted]);

  useEffect(() => {
    const node = folderRef.current;
    node?.setAttribute("webkitdirectory", "");
    node?.setAttribute("directory", "");
    void restoreFolder(dirRef, setFolderName);
  }, []);

  useEffect(() => {
    if (!booted) return;
    if (snaps.some((s) => isGhostAd(s.ad))) setSnaps((curr) => curr.filter((s) => !isGhostAd(s.ad)));
  }, [snaps, booted]);

  const summaries = useMemo(() => summarize(snaps, durations), [snaps, durations]);
  const account = useMemo(() => accountOf(summaries, durations), [summaries, durations]);
  const visible = summaries
    .filter((s) => (!activeOnly || s.latest.activo) && s.ad.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => b.agg.gasto - a.agg.gasto);
  const current = summaries.find((s) => s.ad === selected) ?? visible[0] ?? summaries[0] ?? null;

  async function ingest(list: FileList | File[]) {
    const files = [...list];
    if (!files.length) return;
    setBusy(true);
    try {
      const { snaps: incoming, notes } = await filesToSnaps(files);
      if (!incoming.length) {
        setBanner({ kind: "err", text: notes[0] ?? "No encontré informes válidos." });
        return;
      }
      const merged = mergeSnaps(snaps, incoming);
      setSnaps(merged.next);
      setSkipDemo(true);
      setImportOpen(false);
      const bits = [
        `Carga lista: ${merged.nuevos} registros nuevos, ${merged.actualizados} actualizados.`,
        incoming.some((s) => s.roasAdjusted) ? "Había ROAS en porcentaje (350 o 350%) y quedó en multiplicador (3,50x)." : "",
        incoming.some((s) => s.roasOrigin === "value") ? "Donde faltaba la columna, el ROAS es valor de compras ÷ gasto." : "",
        notes[0] ?? "",
      ].filter(Boolean);
      setBanner({ kind: "ok", text: bits.join(" ") });
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) void ingest(e.dataTransfer.files);
  }

  function loadExample() {
    if (snaps.some((s) => !s.demo) && !window.confirm("Esto sustituye los informes cargados por el ejemplo.")) return;
    setSkipDemo(false);
    setSnaps(buildDemo());
    setBanner({ kind: "ok", text: "Ejemplo cargado: cuatro anuncios con historias distintas de escala, pago, fatiga y landing lenta." });
  }

  function clearAll() {
    if (!snaps.length && Object.keys(durations).length === 0) {
      setImportOpen(true);
      setBanner({ kind: "ok", text: "El panel ya está en ceros. Importa el siguiente informe." });
      return;
    }
    if (!window.confirm("Se borran los informes de este navegador. El panel queda en ceros para un análisis nuevo.")) return;
    setSkipDemo(true);
    setSnaps([]);
    setDurations({});
    setSelected(null);
    setQuery("");
    setActiveOnly(false);
    setScope("ad");
    setImportOpen(true);
    setBanner({ kind: "ok", text: "Datos limpiados. El panel está en ceros: importa el siguiente informe." });
  }

  function exportRows() {
    const ads = new Set(visible.map((s) => s.ad));
    const rows = snaps.filter((s) => ads.has(s.ad));
    if (!rows.length) {
      setBanner({
        kind: "err",
        text: snaps.length
          ? "Ningún anuncio coincide con el filtro activo. Quita la búsqueda o «solo activos» para exportar el resto."
          : "No hay informes que exportar.",
      });
      return null;
    }
    return rows;
  }

  async function onExport(kind: "csv" | "xlsx" | "pdf" | "html") {
    const rows = exportRows();
    if (!rows) return;
    setExportOpen(false);
    const title = brand.name.trim() || DEFAULT_BRAND.name;
    if (kind === "csv") downloadCsv(rows);
    else if (kind === "xlsx") await downloadXlsx(rows);
    else if (kind === "html") downloadStandalone(rows, title);
    else if (!printPdf(rows, title)) setBanner({ kind: "err", text: "El navegador bloqueó la ventana para guardar el PDF." });
  }

  return (
    <main data-testid="elixia-app" className="mx-auto max-w-6xl px-4 pb-16 pt-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" className="grid size-11 place-items-center overflow-hidden rounded-xl bg-logo text-lg font-extrabold text-on-logo" onClick={() => setLookOpen(true)} aria-label="Personalizar marca">
            {brand.logo ? <img src={brand.logo} alt="" className="size-11 object-cover" /> : brand.letter.trim() || "E"}
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              <Tip text={TIP.app}>
                <span className="inline-flex items-center gap-1.5">
                  {brand.name.trim() || DEFAULT_BRAND.name}
                  <HelpMark />
                </span>
              </Tip>
            </h1>
            {brand.tag.trim() && <p className="text-sm text-muted">{brand.tag}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <HelpSwitch />
          <button type="button" className={btnGhost} aria-expanded={lookOpen} onClick={() => setLookOpen((v) => !v)}>
            <CloseMorph open={lookOpen} />
            <span className="hidden sm:inline">{lookOpen ? "Cerrar" : "Apariencia"}</span>
          </button>
          <button type="button" className={btnGhost} onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label={theme === "dark" ? "Tema claro" : "Tema oscuro"}>
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <div className="relative">
            <button type="button" className={btnGhost} aria-expanded={exportOpen} onClick={() => setExportOpen((v) => !v)}>
              <CloseMorph open={exportOpen} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            {exportOpen && (
              <div className="absolute right-0 z-30 mt-1 w-52 rounded-xl border border-line bg-surface p-1 shadow-sm">
                <button type="button" className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold hover:bg-soft" onClick={() => void onExport("xlsx")}>Excel (.xlsx)</button>
                <button type="button" className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold hover:bg-soft" onClick={() => void onExport("csv")}>CSV</button>
                <button type="button" className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold hover:bg-soft" onClick={() => void onExport("pdf")}>PDF para imprimir</button>
                <button type="button" className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold hover:bg-soft" onClick={() => void onExport("html")}>HTML para compartir</button>
              </div>
            )}
          </div>
          <button type="button" className={btnGhost} onClick={clearAll}>
            <Trash2 className="size-4" />
            Limpiar
          </button>
        </div>
      </header>

      {lookOpen && (
        <AppearancePanel
          brand={brand}
          skin={skin}
          theme={theme}
          onBrand={setBrand}
          onSkin={setSkin}
          onTheme={setTheme}
          onError={(text) => setBanner({ kind: "err", text })}
        />
      )}

      <nav className="sticky top-0 z-20 -mx-4 mt-4 flex gap-2 overflow-x-auto border-b border-line bg-canvas/95 px-4 py-2 backdrop-blur">
        <Tip text={TIP.navCuenta}>
          <a className={navLink} href="#atraccion">Atracción</a>
        </Tip>
        <Tip text={TIP.navSitio}>
          <a className={navLink} href="#interes">Interés</a>
        </Tip>
        <Tip text={TIP.fases}>
          <a className={navLink} href="#compra">Compra</a>
        </Tip>
        <Tip text={TIP.navCreativos}>
          <a className={navLink} href="#creativos">Anuncio</a>
        </Tip>
      </nav>

      <section className="mt-4 rounded-2xl border border-line bg-surface">
        <button type="button" className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left" aria-expanded={importOpen} onClick={() => setImportOpen((v) => !v)}>
          <span>
            <Tip text={TIP.importar}>
              <span className="inline-flex items-center gap-1.5 font-bold">
                Importar informes
                <HelpMark />
              </span>
            </Tip>
          </span>
          {importOpen ? <CloseMorph open /> : <CloseMorph open={false} />}
        </button>
        {importOpen && (
          <div className="grid gap-3 border-t border-line p-4 md:grid-cols-2">
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={clsx("rounded-2xl border-2 border-dashed p-4 text-center", dragOver ? "border-accent bg-accent/10" : "border-accent/50")}
            >
              <Upload className="mx-auto size-6 text-accent-ink" />
              <Tip text={TIP.importar} block>
                <p className="mt-2 font-semibold">Arrastra .xlsx o .csv</p>
              </Tip>
              <button type="button" className={clsx(btnLogo, "mt-3")} onClick={() => fileRef.current?.click()} disabled={busy}>
                {busy ? "Leyendo…" : "Elegir archivos"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) void ingest(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="rounded-2xl border border-gold/50 bg-soft p-4 text-center">
              <FolderOpen className="mx-auto size-6 text-gold-ink" />
              <Tip text={TIP.carpeta} className="mt-2">
                <span className="inline-flex items-center justify-center gap-1.5 font-semibold">
                  Carpeta de informes diarios
                  <HelpMark />
                </span>
              </Tip>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className={btnLogo}
                  disabled={busy}
                  onClick={() => {
                    void pickFolder(dirRef, setFolderName, ingest, setBanner, () => folderRef.current?.click());
                  }}
                >
                  Elegir carpeta
                </button>
                {folderName && (
                  <button type="button" className={btnGhost} disabled={busy} onClick={() => dirRef.current && void readHandle(dirRef.current, true, ingest, setBanner)}>
                    <RefreshCw className="size-4" />
                    Releer
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-muted">{folderName ? `Carpeta vinculada: ${folderName}` : "Si el navegador no deja elegir carpeta, se abre el selector de archivos."}</p>
              <input
                ref={folderRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) void ingest(e.target.files);
                  e.target.value = "";
                }}
              />
              <button type="button" className="mt-2 text-sm font-semibold text-accent-ink underline" onClick={loadExample}>
                Cargar datos de ejemplo
              </button>
            </div>
          </div>
        )}
      </section>
      {banner && (
        <p className={clsx("mt-3 rounded-xl px-3 py-2 text-sm font-medium", banner.kind === "err" ? "bg-bad/15 text-bad" : "bg-ok/15 text-ok")} role="status">
          {banner.text}
        </p>
      )}

      <FlowBoard
        account={account}
        ad={current}
        scope={scope}
        onScope={setScope}
        duration={current ? durations[current.ad] : undefined}
        onDuration={(n) => {
          if (!current) return;
          setDurations((d) => {
            const next = { ...d };
            if (n == null) delete next[current.ad];
            else next[current.ad] = n;
            return next;
          });
        }}
      />

      <section className="mt-10" aria-labelledby="sitio-title">
        <BlockHead
          id="sitio"
          titleId="sitio-title"
          title="Dónde se rompe el recorrido"
          lede="El mismo camino, en un embudo: del clic a la compra, con la fuga de carga, la conversión y la fricción del pago."
        />
        <SiteBlock account={account} ad={current} scope={scope} onScope={setScope} />
      </section>

      <section className="mt-10" aria-labelledby="creativos-title">
        <BlockHead
          id="creativos"
          titleId="creativos-title"
          title="Anuncio"
          lede="El anuncio elegido, su veredicto, las señales de Meta, el histórico y la evolución. Las fases de arriba siguen el anuncio o toda la cuenta."
        />
        {!current ? (
          <div className="space-y-3">
            <p className="rounded-2xl border border-line bg-surface px-4 py-8 text-center text-sm text-muted">Sin anuncios. Importa un informe para empezar el análisis.</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi label="Gasto acumulado" value={`${f2(account.gasto)} €`} hint={TIP.gasto} bar="bg-logo" />
              <Kpi label="Compras" value={fi(account.resultados)} hint={TIP.compras} bar="bg-ok" />
              <Kpi label="CPA" value={fm(account.cpa, " €")} hint={TIP.cpa} bar="bg-accent" tone="n" />
              <Kpi label="ROAS" value={fm(account.roas, "x")} hint={TIP.roas} bar="bg-gold" tone="n" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {summaries.length > 0 && (
              <SpendMix items={summaries.map((s) => ({ ad: s.ad, gasto: s.agg.gasto, history: s.history }))} theme={theme} skin={skin} />
            )}
          <div className="grid items-start gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-line bg-surface p-3 xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar anuncio"
                  className="min-h-11 w-full rounded-xl border border-line bg-soft py-2 pr-3 pl-9 text-sm"
                  aria-label="Buscar anuncio"
                />
              </div>
              <Tip text={TIP.activos}>
                <label className="mt-2 flex min-h-11 items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
                  Solo activos
                  <HelpMark />
                </label>
              </Tip>
              <ul className="mt-2 space-y-2">
                {visible.length === 0 && <li className="px-1 py-6 text-center text-sm text-muted">Ningún anuncio con ese filtro.</li>}
                {visible.map((item) => {
                  const on = item.ad === current.ad;
                  const verdict = getVerdict(item.agg);
                  return (
                    <li key={item.ad}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item.ad);
                          setScope("ad");
                        }}
                        aria-current={on ? "true" : undefined}
                        className={clsx("w-full rounded-xl border px-3 py-3 text-left", on ? "border-accent bg-accent/10" : "border-line bg-soft")}
                      >
                        <span className="flex items-start gap-2">
                          <span className={clsx("mt-1 size-2.5 shrink-0 rounded-full", item.latest.activo ? "bg-ok" : "bg-muted")} />
                          <span className="min-w-0">
                            <span className="block truncate font-bold">{item.ad}</span>
                            <span className="block text-xs text-muted">
                              {item.history.length} informes · hasta {formatRange(item.latest.fin, item.latest.fin)}
                            </span>
                          </span>
                        </span>
                        <span className="mt-2 flex items-center justify-between gap-2 text-sm">
                          <span className="font-mono tabular-nums">{f2(item.agg.gasto)} €</span>
                          <span className={clsx("rounded-full px-2 py-0.5 text-xs font-bold", toneChip(verdictTone(verdict.k)))}>{verdict.t}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <AdDetail
              ad={current.ad}
              campaign={current.campaign}
              history={current.history}
              latestActivo={current.latest.activo}
              agg={current.agg}
              metric={metric}
              onMetric={setMetric}
              theme={theme}
              skin={skin}
              duration={durations[current.ad]}
            />
          </div>
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-surface px-4 py-3">
        <details>
          <summary className="cursor-pointer text-sm font-bold">Leyenda del semáforo</summary>
          <dl className="mt-3 space-y-2 text-sm text-muted">
            {LEGEND.map((row) => (
              <div key={row.name}>
                <dt className="font-semibold text-fg">{row.name}</dt>
                <dd>{row.rule}</dd>
              </div>
            ))}
          </dl>
        </details>
      </section>
    </main>
  );
}

const navLink = "inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-xl border border-line bg-surface px-4 text-sm font-bold text-fg shadow-sm transition-colors hover:border-accent hover:bg-accent/10 hover:shadow-md focus-visible:border-accent active:bg-accent/20";

function CloseMorph({ open }: { open: boolean }) {
  return (
    <span className="relative block size-4 shrink-0" aria-hidden>
      <span className={clsx("absolute left-0 h-0.5 w-4 rounded-full bg-current transition-transform duration-200", open ? "top-[7px] rotate-45" : "top-0.5")} />
      <span className={clsx("absolute top-[7px] left-0 h-0.5 w-4 rounded-full bg-current transition-opacity duration-200", open ? "opacity-0" : "opacity-100")} />
      <span className={clsx("absolute left-0 h-0.5 w-4 rounded-full bg-current transition-transform duration-200", open ? "top-[7px] -rotate-45" : "top-2.5")} />
    </span>
  );
}

function BlockHead({ id, titleId, title, lede }: { id: string; titleId: string; title: string; lede: string }) {
  return (
    <header id={id} className="mb-4 scroll-mt-24">
      <h2 id={titleId} className="text-xl font-extrabold tracking-tight">
        <Tip text={lede}>
          <span className="inline-flex items-center gap-1.5">
            {title}
            <HelpMark />
          </span>
        </Tip>
      </h2>
    </header>
  );
}

function Kpi({ label, value, hint, bar, tone, testId }: { label: string; value: string; hint: string; bar: string; tone?: Tone; testId?: string }) {
  return (
    <Tip text={hint} block>
      <article className="relative h-full overflow-hidden rounded-2xl border border-line bg-surface px-4 py-4 shadow-sm" data-testid={testId}>
        <span className={clsx("absolute inset-y-0 left-0 w-1", bar)} />
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted uppercase">
          {label}
          <HelpMark />
        </p>
        <p className={clsx("mt-2 font-mono text-2xl font-bold tabular-nums", toneText(tone))}>{value}</p>
      </article>
    </Tip>
  );
}

function AdDetail({
  ad,
  campaign,
  history,
  latestActivo,
  agg,
  metric,
  onMetric,
  theme,
  skin,
  duration,
}: {
  ad: string;
  campaign: string;
  history: Snap[];
  latestActivo: boolean;
  agg: Agg;
  metric: ChartKey;
  onMetric: (m: ChartKey) => void;
  theme: "light" | "dark";
  skin: SkinId;
  duration?: number;
}) {
  const verdict = getVerdict(agg);
  const signals = creativeSignals(history, agg);
  const [histSort, setHistSort] = useState<{ key: HistKey; dir: "asc" | "desc" }>({ key: "fecha", dir: "asc" });
  const historyRows = [...history].sort((a, b) => compareHist(a, b, histSort.key, histSort.dir, duration));
  return (
    <div className="min-w-0 space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted">{campaign || (latestActivo ? "Activo" : "No activo")}</p>
            <h3 className="text-lg font-extrabold tracking-tight">{ad}</h3>
          </div>
          <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", toneChip(verdictTone(verdict.k)))}>
            <Tip text={TIP.veredicto}>
              <span className="inline-flex items-center gap-1.5">
                <VerdictIcon k={verdict.k} />
                {verdict.t}
                <HelpMark />
              </span>
            </Tip>
          </span>
        </div>
        <AiNote>{verdict.why}</AiNote>
        {agg.skipped > 0 && (
          <p className="mt-2 text-xs text-muted">{agg.skipped} informes solapados fuera del total.</p>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <h3 className="font-bold">
          <Tip text={TIP.edad}>
            <span className="inline-flex items-center gap-1.5">
              Señales del anuncio
              <HelpMark />
            </span>
          </Tip>
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Signal label="CPM" value={fm(signals.cpm, " €")} hint={TIP.cpm} />
          <Signal
            label="Reacciones"
            value={signals.reactions == null ? "—" : `${fi(signals.reactions)} · ${fm(signals.reactionRate, "%")}`}
            hint={TIP.reacciones}
          />
          <Signal label="Calidad" value={signals.quality ?? "Sin puntuar"} hint={TIP.calidad} tone={rankTone(signals.quality)} />
          <Signal label="Conversiones" value={signals.convRank ?? "Sin puntuar"} hint={TIP.ranking} tone={rankTone(signals.convRank)} />
        </div>
        {signals.notes.length > 0 && (
          <AiNote>
            <ul className="space-y-1">
              {signals.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </AiNote>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SPARK_KEYS.map((key) => {
          const def = CHART_METRICS.find((m) => m.id === key)!;
          const value = key === "alcance" ? fi(agg.alcance) : fm(agg[key as keyof Agg] as number | null, suffixFor(key));
          const tone = toneFor(key, typeof agg[key as keyof Agg] === "number" ? (agg[key as keyof Agg] as number) : null);
          return (
            <article key={key} className={clsx("h-full rounded-2xl border px-3 py-3", tonePanel(tone))}>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Tip text={sparkTip(key)}>
                  <span className="inline-flex items-center gap-1.5">
                    {def.label}
                    {key === "alcance" ? " · suma de días" : ""}
                    <HelpMark />
                  </span>
                </Tip>
              </p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
              <Spark
                points={sparkPoints(history, key, duration)}
                tone={tone}
                mark={def.thresholds ? (def.hi ? def.thresholds[1] : def.thresholds[0]) : undefined}
                format={(n) => formatMetric(key, n)}
              />
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <h3 className="mb-3 font-bold">
          <Tip text={TIP.historico}>
            <span className="inline-flex items-center gap-1.5">
              Desglose histórico
              <HelpMark />
            </span>
          </Tip>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-right text-sm">
            <thead>
              <tr className="text-xs tracking-wide text-muted uppercase">
                {HIST_COLS.map((col) => {
                  const on = histSort.key === col.id;
                  return (
                    <th
                      key={col.id}
                      aria-sort={on ? (histSort.dir === "asc" ? "ascending" : "descending") : "none"}
                      className={clsx("border-b border-line px-1 py-1 font-semibold", col.id === "fecha" && "sticky left-0 bg-surface text-left")}
                    >
                      <button
                        type="button"
                        className={clsx("inline-flex min-h-11 w-full items-center gap-1 rounded-lg px-1", col.id === "fecha" ? "justify-start" : "justify-end")}
                        onClick={() =>
                          setHistSort((cur) =>
                            cur.key === col.id ? { key: col.id, dir: cur.dir === "asc" ? "desc" : "asc" } : { key: col.id, dir: "desc" },
                          )
                        }
                      >
                        <Tip text={col.tip}>{col.label}</Tip>
                        {on ? (
                          histSort.dir === "asc" ? <ArrowUp className="size-3.5 shrink-0" /> : <ArrowDown className="size-3.5 shrink-0" />
                        ) : (
                          <ArrowUpDown className="size-3.5 shrink-0 opacity-40" />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => (
                <HistoryRow key={`${row.inicio}-${row.fin}-${row.gasto}`} row={row} duration={duration} />
              ))}
              <tr className="font-bold">
                <td className="sticky left-0 border-t-2 border-accent bg-surface px-2 py-2 text-left">
                  Acumulado ({agg.n}
                  {agg.skipped ? `, ${agg.skipped} solapados fuera` : ""})
                </td>
                <td className="border-t-2 border-accent px-2 py-2">{f2(agg.gasto)}</td>
                <td className="border-t-2 border-accent px-2 py-2">{fi(agg.resultados)}</td>
                <ToneCell tone={toneFor("cpa", agg.cpa)} top>
                  {fm(agg.cpa)}
                </ToneCell>
                <ToneCell tone={toneFor("roas", agg.roas)} top>
                  {fm(agg.roas, "x")}
                </ToneCell>
                <td className="border-t-2 border-accent px-2 py-2 text-muted">
                  <Tip text={TIP.alcance}>{fi(agg.alcance)}</Tip>
                </td>
                <ToneCell tone={toneFor("freq", agg.freq)} top>
                  {fm(agg.freq)}
                </ToneCell>
                <ToneCell tone={toneFor("ctr", agg.ctr)} top>
                  {fm(agg.ctr)}
                </ToneCell>
                <ToneCell tone={toneFor("lpv", agg.lpv)} top>
                  {fm(agg.lpv)}
                </ToneCell>
                <ToneCell tone={toneFor("hook", agg.hook)} top>
                  {fm(agg.hook)}
                </ToneCell>
                <ToneCell tone={toneFor("avgT", agg.avgT)} top>
                  {fm(agg.avgT)}
                </ToneCell>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <h3 className="mb-3 font-bold">
          <Tip text={TIP.evolucion}>
            <span className="inline-flex items-center gap-1.5">
              Evolución temporal
              <HelpMark />
            </span>
          </Tip>
        </h3>
        <ChartPanel history={history} metric={CHART_GROUPS.some((g) => g.keys.includes(metric)) ? metric : "gasto"} onMetric={onMetric} duration={duration} theme={theme} skin={skin} />
      </div>
    </div>
  );
}

type HistKey = "fecha" | "gasto" | "resultados" | "cpa" | "roas" | "alcance" | "freq" | "ctr" | "lpv" | "hook" | "avgT";

const HIST_COLS: { id: HistKey; label: string; tip: string }[] = [
  { id: "fecha", label: "Fecha informe", tip: TIP.fecha },
  { id: "gasto", label: "Gasto (€)", tip: TIP.gasto },
  { id: "resultados", label: "Compras", tip: TIP.compras },
  { id: "cpa", label: "CPA (€)", tip: TIP.cpa },
  { id: "roas", label: "ROAS", tip: TIP.roas },
  { id: "alcance", label: "Alcance", tip: TIP.alcance },
  { id: "freq", label: "Frecuencia", tip: TIP.freq },
  { id: "ctr", label: "CTR enlace (%)", tip: TIP.ctr },
  { id: "lpv", label: "Carga LPV (%)", tip: TIP.lpv },
  { id: "hook", label: "Hook rate (%)", tip: TIP.hook },
  { id: "avgT", label: "Tiempo medio (s)", tip: TIP.avgT },
];

function histValue(row: Snap, key: HistKey, duration?: number): number | null {
  if (key === "fecha") {
    const t = Date.parse(`${row.fin}T00:00:00Z`);
    return Number.isFinite(t) ? t : null;
  }
  if (key === "hook") return aggregate([row], duration).hook;
  const v = row[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function compareHist(a: Snap, b: Snap, key: HistKey, dir: "asc" | "desc", duration?: number): number {
  const va = histValue(a, key, duration);
  const vb = histValue(b, key, duration);
  if (va == null && vb == null) return a.fin.localeCompare(b.fin);
  if (va == null) return 1;
  if (vb == null) return -1;
  if (va === vb) return a.fin.localeCompare(b.fin) || a.inicio.localeCompare(b.inicio);
  return dir === "asc" ? va - vb : vb - va;
}

function sparkTip(key: ChartKey): string {
  if (key === "roas") return TIP.roas;
  if (key === "cpa") return TIP.cpa;
  if (key === "ctr") return TIP.ctr;
  if (key === "freq") return TIP.freq;
  if (key === "lpv") return TIP.lpv;
  if (key === "hook") return TIP.hook;
  if (key === "hold") return TIP.hold;
  if (key === "avgT") return TIP.avgT;
  if (key === "alcance") return TIP.alcance;
  return "";
}

function suffixFor(key: ChartKey): string {
  if (key === "cpa") return " €";
  if (key === "roas") return "x";
  if (key === "avgT") return " s";
  if (key === "ctr" || key === "lpv" || key === "hook" || key === "hold") return "%";
  return "";
}

function HistoryRow({ row, duration }: { row: Snap; duration?: number }) {
  const v = aggregate([row], duration);
  return (
    <tr className="border-b border-line">
      <td className="sticky left-0 bg-surface px-2 py-2 text-left font-semibold">{formatRange(row.inicio, row.fin)}</td>
      <td className="px-2 py-2">{f2(row.gasto)}</td>
      <td className="px-2 py-2">{fi(row.resultados)}</td>
      <ToneCell tone={toneFor("cpa", row.cpa)}>{fm(row.cpa)}</ToneCell>
      <ToneCell tone={toneFor("roas", row.roas)}>{fm(row.roas, "x")}</ToneCell>
      <td className="px-2 py-2 text-muted">{fi(row.alcance)}</td>
      <ToneCell tone={toneFor("freq", row.freq)}>{fm(row.freq)}</ToneCell>
      <ToneCell tone={toneFor("ctr", row.ctr)}>{fm(row.ctr)}</ToneCell>
      <ToneCell tone={toneFor("lpv", row.lpv)}>{fm(row.lpv)}</ToneCell>
      <ToneCell tone={toneFor("hook", v.hook)}>{fm(v.hook)}</ToneCell>
      <ToneCell tone={toneFor("avgT", row.avgT)}>{fm(row.avgT)}</ToneCell>
    </tr>
  );
}

function ToneCell({ tone, children, top }: { tone: Tone; children: ReactNode; top?: boolean }) {
  return (
    <td className={clsx("px-2 py-2 font-semibold", top && "border-t-2 border-accent", toneChip(tone))}>
      <Tip text={toneTitle(tone)}>{children}</Tip>
    </td>
  );
}

function AiNote({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className={clsx("flex gap-2.5 rounded-2xl border border-accent/50 bg-soft", compact ? "mt-2 px-2.5 py-2" : "mt-3 px-3 py-3")}>
      <span className={clsx("grid shrink-0 place-items-center rounded-full bg-logo text-on-logo", compact ? "size-6" : "size-8")} aria-hidden>
        <Sparkles className={compact ? "size-3.5" : "size-4"} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-widest text-accent-ink uppercase">Lectura</p>
        <div className="mt-0.5 text-sm text-fg">{children}</div>
      </div>
    </div>
  );
}

function Signal({ label, value, hint, tone = "n" }: { label: string; value: string; hint: string; tone?: Tone }) {
  return (
    <Tip text={hint} block>
      <article className={clsx("h-full rounded-xl border px-3 py-3", tonePanel(tone))}>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
          {label}
          <HelpMark />
        </p>
        <p className="mt-1 text-sm font-bold">{value}</p>
      </article>
    </Tip>
  );
}

function Mini({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: Tone }) {
  return (
    <Tip text={hint} block>
      <article className={clsx("h-full rounded-xl border px-3 py-3", tonePanel(tone))}>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
          {label}
          <HelpMark />
        </p>
        <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
      </article>
    </Tip>
  );
}

function FlowBoard({
  account,
  ad,
  scope,
  onScope,
  duration,
  onDuration,
}: {
  account: Agg;
  ad: { ad: string; agg: Agg; history: Snap[] } | null;
  scope: "ad" | "account";
  onScope: (s: "ad" | "account") => void;
  duration?: number;
  onDuration: (n: number | null) => void;
}) {
  const agg = scope === "account" || !ad ? account : ad.agg;
  const signals = ad && scope === "ad" ? creativeSignals(ad.history, ad.agg) : null;
  const holdTone = signals && signals.plays3 != null && signals.plays3 < 30 ? "n" : toneFor("hold", agg.hold);
  const hasVideo = agg.hook != null || agg.hold != null || agg.avgT != null;
  const cpm = div(agg.gasto, agg.impr, 1000);
  const cpc = div(agg.gasto, agg.clics);
  const cpv = div(agg.gasto, agg.vis);
  const atcRate = div(agg.atc, agg.vis, 100);
  const cut = flowCut(agg);
  return (
    <div className="mt-8 space-y-10">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={scope === "ad" ? btnLogo : btnGhost} onClick={() => onScope("ad")} disabled={!ad}>
          Anuncio seleccionado
        </button>
        <button type="button" className={scope === "account" ? btnLogo : btnGhost} onClick={() => onScope("account")}>
          Toda la cuenta
        </button>
      </div>

      <section aria-labelledby="atraccion-title">
        <BlockHead
          id="atraccion"
          titleId="atraccion-title"
          title="Atracción"
          lede="Arriba del recorrido: cuántas veces se muestra, a cuántas personas, si el clic sale del anuncio y si el vídeo pasa de los 3 segundos."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Impresiones" value={fi(agg.impr)} hint={TIP.impr} bar="bg-logo" />
          <Kpi label="Alcance" value={fi(agg.alcance)} hint={TIP.alcance} bar="bg-accent" />
          <Kpi label="Frecuencia" value={fm(agg.freq)} hint={TIP.freq} bar="bg-gold" tone={toneFor("freq", agg.freq)} />
          <Kpi label="CTR enlace" value={fm(agg.ctr, "%")} hint={TIP.ctr} bar="bg-accent" tone={toneFor("ctr", agg.ctr)} />
          <Kpi label="Hook rate" value={fm(agg.hook, "%")} hint={TIP.hook} bar="bg-ok" tone={toneFor("hook", agg.hook)} />
          <Kpi label="Hold rate" value={fm(agg.hold, "%")} hint={TIP.hold} bar="bg-ok" tone={holdTone} />
          <Kpi label="Tiempo medio" value={fm(agg.avgT, " s")} hint={TIP.avgT} bar="bg-gold" tone={toneFor("avgT", agg.avgT)} />
          <Kpi label="Visto del vídeo" value={fm(agg.watch, "%")} hint={TIP.watch} bar="bg-logo" tone={toneFor("watch", agg.watch)} />
          <Kpi label="CPM" value={fm(cpm, " €")} hint={TIP.cpm} bar="bg-accent" />
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-bold">Vídeo</p>
            {!hasVideo && <p className="text-sm text-muted">Este conjunto no trae reproducciones.</p>}
            {(agg.hold50 != null || agg.hold75 != null || agg.complete != null) && (
              <p className="text-sm text-muted">
                De quienes vieron 3 s
                {agg.hold50 != null ? ` · mitad ${fm(agg.hold50, "%")}` : ""}
                {agg.hold75 != null ? ` · 75% ${fm(agg.hold75, "%")}` : ""}
                {agg.complete != null ? ` · cierre ${fm(agg.complete, "%")}` : ""}
              </p>
            )}
          </div>
          {scope === "ad" && ad && (
            <Tip text={TIP.duracion}>
              <label className="text-xs font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  Duración del vídeo (s)
                  <HelpMark />
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={duration ?? ""}
                  placeholder="ej. 15"
                  aria-label="Duración del vídeo en segundos"
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    onDuration(!e.target.value || !Number.isFinite(n) || n <= 0 ? null : n);
                  }}
                  className="mt-1 block min-h-11 w-28 rounded-xl border border-line bg-soft px-3 font-mono text-sm text-fg"
                />
              </label>
            </Tip>
          )}
        </div>
      </section>

      <section aria-labelledby="interes-title">
        <BlockHead
          id="interes"
          titleId="interes-title"
          title="Interés"
          lede="El clic ya salió. Aquí se ve quién espera a que cargue la landing y cuánto cuesta esa visita de verdad."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Clics en el enlace" value={fi(agg.clics)} hint={TIP.ctr} bar="bg-accent" />
          <Kpi label="Visitas a la landing" value={fi(agg.vis)} hint={TIP.lpv} bar="bg-ok" />
          <Kpi label="Carga LPV" value={fm(agg.lpv, "%")} hint={TIP.lpv} bar="bg-ok" tone={toneFor("lpv", agg.lpv)} />
          <Kpi label="Fuga de carga" value={fm(agg.dropoff, "%")} hint={TIP.dropoff} bar="bg-gold" tone={toneFor("dropoff", agg.dropoff)} />
          <Kpi label="CPC" value={fm(cpc, " €")} hint={TIP.cpc} bar="bg-logo" />
          <Kpi label="Costo por visita" value={fm(cpv, " €")} hint={TIP.cpv} bar="bg-logo" />
        </div>
      </section>

      <section aria-labelledby="compra-title">
        <BlockHead
          id="compra"
          titleId="compra-title"
          title="Compra"
          lede="Dentro de la tienda: carrito, inicio de pago, compras, lo que cuesta cada una y el retorno del gasto."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Añadidos al carrito" value={fi(agg.atc)} hint={TIP.atcRate} bar="bg-accent" />
          <Kpi label="Tasa de carrito" value={fm(atcRate, "%")} hint={TIP.atcRate} bar="bg-accent" />
          <Kpi label="Inicios de pago" value={fi(agg.ic)} hint={TIP.intent} bar="bg-gold" />
          <Kpi label="IC / ATC" value={fm(agg.intent, "%")} hint={TIP.intent} bar="bg-gold" tone={toneFor("intent", agg.intent)} />
          <Kpi label="Compras" value={fi(agg.resultados)} hint={TIP.compras} bar="bg-ok" />
          <Kpi label="CR global" value={fm(agg.cr, "%")} hint={TIP.cr} bar="bg-ok" tone={toneFor("cr", agg.cr)} />
          <Kpi label="Gasto" value={`${f2(agg.gasto)} €`} hint={TIP.gasto} bar="bg-logo" />
          <Kpi label="CPA" value={fm(agg.cpa, " €")} hint={TIP.cpa} bar="bg-accent" tone={toneFor("cpa", agg.cpa)} testId="kpi-cpa" />
          <Kpi label="ROAS" value={fm(agg.roas, "x")} hint={agg.roasAdjusted ? `${TIP.roas} Este valor venía en porcentaje y ya está en multiplicador.` : TIP.roas} bar="bg-gold" tone={toneFor("roas", agg.roas)} testId="kpi-roas" />
        </div>
        <AiNote>{cut}</AiNote>
      </section>
    </div>
  );
}

function flowCut(agg: Agg): string {
  if (agg.clics <= 0 && agg.impr <= 0 && agg.gasto <= 0) return "Cuando haya impresiones y clics, aquí se señala si el corte está en el anuncio, en la carga o en la compra.";
  if (agg.ctr != null && agg.ctr < 1.5) return "El CTR no llega al 1,50%. El corte está arriba: el anuncio no se gana el clic.";
  if ((agg.dropoff != null && agg.dropoff > 30) || (agg.lpv != null && agg.lpv < 70)) return "El clic sale, pero la página no lo sostiene. El corte está en la velocidad o en la URL, no en el creativo.";
  if (agg.atc != null && agg.atc > 0 && agg.resultados === 0) return "Hay carritos y no hay compras. El corte está en la oferta, el precio o la pasarela.";
  if (agg.intent != null && agg.intent < 40) return "Se cae entre el carrito y el inicio de pago. Todavía no es el cobro: es el paso anterior.";
  if (agg.payRate != null && agg.intent != null && agg.intent >= 55 && agg.payRate < 45) return "Llegan al pago y no compran. El corte está en el checkout: el formulario, la confianza o el método de pago.";
  if (agg.cr != null && agg.cr < 1) return "La conversión global está por debajo del 1%. Ninguna fase sola explica el fallo: baja por el recorrido.";
  return "Atracción, carga y compra no marcan un único corte. Si no escala, el límite está en el coste del clic o en el valor del pedido.";
}

function SiteBlock({
  account,
  ad,
  scope,
  onScope,
}: {
  account: Agg;
  ad: { ad: string; agg: Agg } | null;
  scope: "ad" | "account";
  onScope: (s: "ad" | "account") => void;
}) {
  const agg = scope === "account" || !ad ? account : ad.agg;
  const story = siteDiagnosis(agg);
  const drop = dropoffRead(agg.dropoff);
  const cr = crRead(agg.cr);
  const intent = intentRead(agg);
  const payCut = agg.intent != null && agg.intent >= 55 && agg.payRate != null && agg.payRate < 45;
  const steps = [
    { label: "Clics en el enlace", value: agg.clics },
    { label: "Visitas a la landing", value: agg.vis },
    { label: "Añadidos al carrito", value: agg.atc },
    { label: "Inicios de pago", value: agg.ic },
    { label: "Compras", value: agg.resultados },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={scope === "ad" ? btnLogo : btnGhost} onClick={() => onScope("ad")} disabled={!ad}>
          Anuncio seleccionado
        </button>
        <button type="button" className={scope === "account" ? btnLogo : btnGhost} onClick={() => onScope("account")}>
          Toda la cuenta
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="font-bold">
            <Tip text={TIP.embudo}>
              <span className="inline-flex items-center gap-1.5">
                Embudo
                <HelpMark />
              </span>
            </Tip>
          </h3>
          <Funnel steps={steps} />
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="font-bold">Lecturas</h3>
          <ul className="mt-3 divide-y divide-line">
            <ReadRow label="Fuga de carga" tip={TIP.dropoff} value={fm(agg.dropoff, "%")} title={drop.title} tone={drop.tone} />
            <ReadRow label="CR% global" tip={TIP.cr} value={fm(agg.cr, "%")} title={cr.title} tone={cr.tone}>
              <CrMeter value={agg.cr} />
            </ReadRow>
            <ReadRow
              label={payCut ? "Cobro del pago" : "Paso de pago"}
              tip={TIP.intent}
              value={payCut ? fm(agg.payRate, "%") : agg.intent == null ? "—" : `${f2(agg.intent)}%`}
              title={intent.title}
              tone={intent.tone}
            />
          </ul>
          {story.tone === "n" ? (
            <p className="mt-3 text-sm text-muted">{story.body}</p>
          ) : (
            story.body && <AiNote>{story.body}</AiNote>
          )}
        </article>
      </div>
    </div>
  );
}

function ReadRow({
  label,
  tip,
  value,
  title,
  tone,
  children,
}: {
  label: string;
  tip: string;
  value: string;
  title: string;
  tone: Tone;
  children?: ReactNode;
}) {
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          <Tip text={tip}>
            <span className="inline-flex items-center gap-1.5">
              {label}
              <HelpMark />
            </span>
          </Tip>
        </p>
        <p className={clsx("font-mono text-xl font-bold tabular-nums", toneText(tone))}>{value}</p>
      </div>
      <p className="mt-0.5 text-sm font-semibold">{title}</p>
      {children}
    </li>
  );
}

function Funnel({ steps }: { steps: { label: string; value: number | null }[] }) {
  const base = steps[0]?.value != null && steps[0].value > 0 ? steps[0].value : (steps.find((s) => s.value != null && s.value > 0)?.value ?? null);
  let carry = 80;
  const widths = steps.map((s) => {
    if (base == null || base <= 0 || s.value == null) return carry;
    carry = Math.min(80, Math.max(0, (s.value / base) * 80));
    return carry;
  });
  return (
    <ol className="mt-4 flex w-full flex-col items-center">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const loss = s.value != null && prev != null && prev > 0 ? ((prev - s.value) / prev) * 100 : null;
        const tone = connectorTone(i, prev, s.value);
        return (
          <li key={s.label} className="flex w-full flex-col items-center">
            {i > 0 &&
              (loss == null ? (
                <span className="my-1 h-4 w-px bg-line" aria-hidden />
              ) : (
                <p className={clsx("flex h-7 items-center font-mono text-xs tabular-nums", tone ? toneText(tone) : "text-muted")}>
                  {loss >= 0 ? "−" : "+"}
                  {f2(Math.abs(loss))}%
                </p>
              ))}
            <div
              className={clsx("rounded-xl border px-2 py-2 text-center", funnelFace(i === 0 ? "src" : tone))}
              style={{ width: `clamp(8.75rem, ${widths[i]}%, 80%)` }}
            >
              <p className="text-xs font-semibold leading-snug text-balance">{s.label}</p>
              <p className="font-mono text-base font-bold tabular-nums">{s.value == null ? "—" : fi(s.value)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function connectorTone(index: number, prev: number | null, value: number | null): Tone | null {
  if (prev == null || value == null || prev <= 0) return null;
  const keep = (value / prev) * 100;
  if (index === 1) return keep >= 85 ? "g" : keep >= 70 ? "y" : "r";
  if (index === 3) return keep >= 55 ? "g" : keep >= 40 ? "y" : "r";
  if (index === 4) return keep >= 45 ? "g" : "r";
  return null;
}

function funnelFace(tone: Tone | "src" | null): string {
  if (tone === "src") return "border-accent/40 bg-accent/15";
  if (tone === "g") return "border-ok/40 bg-ok/10";
  if (tone === "y") return "border-warn/40 bg-warn/10";
  if (tone === "r") return "border-bad/40 bg-bad/10";
  return "border-line bg-soft";
}

function CrMeter({ value }: { value: number | null }) {
  const cap = 3;
  const pos = value == null ? null : Math.min(100, Math.max(0, (value / cap) * 100));
  const bandL = (1 / cap) * 100;
  const bandW = ((1.5 - 1) / cap) * 100;
  return (
    <div className="mt-2">
      <div className="relative h-2 rounded-full bg-soft">
        <div className="absolute inset-y-0 rounded-full bg-ok/40" style={{ left: `${bandL}%`, width: `${bandW}%` }} />
        {pos != null && <div className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-logo" style={{ left: `${pos}%` }} />}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>0%</span>
        <span>referencia 1–1,5%</span>
        <span>3%+</span>
      </div>
    </div>
  );
}

function VerdictIcon({ k }: { k: VerdictKey }) {
  const cls = "size-4";
  if (k === "esc") return <TrendingUp className={cls} />;
  if (k === "var") return <FlaskConical className={cls} />;
  if (k === "apa") return <Power className={cls} />;
  if (k === "vig") return <Eye className={cls} />;
  return <Hourglass className={cls} />;
}

function verdictTone(k: VerdictKey): Tone {
  if (k === "esc") return "g";
  if (k === "var") return "y";
  if (k === "apa") return "r";
  return "n";
}

function toneText(tone?: Tone): string {
  if (tone === "g") return "text-ok";
  if (tone === "y") return "text-warn";
  if (tone === "r") return "text-bad";
  return "text-fg";
}

function toneChip(tone: Tone): string {
  if (tone === "g") return "bg-ok/15 text-ok";
  if (tone === "y") return "bg-warn/15 text-warn";
  if (tone === "r") return "bg-bad/15 text-bad";
  return "text-muted";
}

function tonePanel(tone: Tone): string {
  if (tone === "g") return "border-ok/40 bg-ok/10";
  if (tone === "y") return "border-warn/40 bg-warn/10";
  if (tone === "r") return "border-bad/40 bg-bad/10";
  return "border-line bg-surface";
}

function toneTitle(tone: Tone): string {
  if (tone === "g") return "En rango";
  if (tone === "y") return "Zona intermedia";
  if (tone === "r") return "Fuera de rango";
  return "Sin dato";
}

type DirHandle = {
  name: string;
  queryPermission: (desc: { mode: "read" }) => Promise<PermissionState>;
  requestPermission: (desc: { mode: "read" }) => Promise<PermissionState>;
  values: () => AsyncIterable<FileSystemHandle & { getFile?: () => Promise<File> }>;
};

async function pickFolder(
  dirRef: { current: DirHandle | null },
  setName: (n: string | null) => void,
  ingest: (files: File[]) => Promise<void>,
  setBanner: (b: { kind: "ok" | "err"; text: string }) => void,
  fallback: () => void,
) {
  const picker = (window as Window & { showDirectoryPicker?: () => Promise<DirHandle> }).showDirectoryPicker;
  if (!picker) {
    fallback();
    return;
  }
  try {
    const handle = await picker();
    dirRef.current = handle;
    setName(handle.name);
    try {
      await idbPut(handle);
    } catch {
      /* la carpeta se usa en esta sesión aunque no se pueda recordar */
    }
    await readHandle(handle, true, ingest, setBanner);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    fallback();
  }
}

async function readHandle(
  handle: DirHandle,
  interactive: boolean,
  ingest: (files: File[]) => Promise<void>,
  setBanner: (b: { kind: "ok" | "err"; text: string }) => void,
) {
  let perm = await handle.queryPermission({ mode: "read" });
  if (perm !== "granted" && interactive) perm = await handle.requestPermission({ mode: "read" });
  if (perm !== "granted") {
    setBanner({ kind: "err", text: "No hay permiso para leer esa carpeta." });
    return;
  }
  const files: File[] = [];
  await collectFiles(handle, files);
  if (!files.length) {
    setBanner({ kind: "err", text: "Esa carpeta no tiene .xlsx ni .csv." });
    return;
  }
  await ingest(files);
}

async function collectFiles(handle: DirHandle, out: File[]) {
  for await (const entry of handle.values()) {
    if (entry.kind === "file") {
      if (/\.(xlsx|xls|csv)$/i.test(entry.name) && !entry.name.startsWith("~$") && entry.getFile) out.push(await entry.getFile());
    } else {
      await collectFiles(entry as unknown as DirHandle, out);
    }
  }
}

async function restoreFolder(dirRef: { current: DirHandle | null }, setName: (n: string | null) => void) {
  if (!(window as Window & { showDirectoryPicker?: unknown }).showDirectoryPicker) return;
  try {
    const handle = await idbGet();
    if (!handle) return;
    dirRef.current = handle;
    setName(handle.name);
  } catch {
    /* indexedDB no disponible */
  }
}

function idbPut(handle: DirHandle) {
  return idb("readwrite", (store) => store.put(handle, "dir"));
}

function idbGet(): Promise<DirHandle | null> {
  return idb("readonly", (store) => store.get("dir")) as Promise<DirHandle | null>;
}

function idb(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("elixia_fs", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("h");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction("h", mode);
      const req = fn(tx.objectStore("h"));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
    };
  });
}
