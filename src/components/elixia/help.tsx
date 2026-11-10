import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import clsx from "clsx";

const KEY = "elixia_help";

const HelpCtx = createContext<{ on: boolean; setOn: (v: boolean) => void }>({ on: true, setOn: () => {} });

export function HelpProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (localStorage.getItem(KEY) === "0") setOn(false);
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, on ? "1" : "0");
  }, [on, ready]);
  return <HelpCtx.Provider value={{ on, setOn }}>{children}</HelpCtx.Provider>;
}

export function useHelp() {
  return useContext(HelpCtx);
}

export function HelpMark() {
  const { on } = useHelp();
  if (!on) return null;
  return <CircleHelp className="size-3.5 shrink-0 text-muted" aria-hidden />;
}

export function HelpSwitch() {
  const { on, setOn } = useHelp();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-fg"
    >
      <span>Ayuda</span>
      <span className={clsx("relative h-6 w-11 rounded-full", on ? "bg-accent" : "bg-line")} aria-hidden>
        <span className={clsx("absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow-sm", on && "translate-x-5")} />
      </span>
      <span className="w-7 text-left">{on ? "On" : "Off"}</span>
    </button>
  );
}

export const TIP = {
  app: "Tres diagnósticos en orden: cómo va la cuenta, qué creativo aguanta y dónde se pierde la compra en la web.",
  cuenta: "Gasto, compras, CPA y ROAS de toda la cuenta. El color usa los mismos cortes que un anuncio, calculados con sumas y no con medias de porcentajes.",
  creativos: "Lista de anuncios, histórico, hook, hold rate y el veredicto de escalar o apagar.",
  sitio: "Dónde se cae el clic: carga de la página, conversión de clic a compra y si el carrito muere antes o después del pago.",
  importar: "Suelta aquí los Excel o CSV de Meta. Al cargar se pliega para dejar sitio a los tres bloques. Si repites fechas, se actualiza y no se duplica el gasto.",
  carpeta: "Lee todos los Excel y CSV de una carpeta. Los informes que ya estaban se actualizan.",
  gastoMix: "Reparto del gasto entre anuncios, para ver quién se lleva el presupuesto de la cuenta.",
  video: "Cómo aguanta el vídeo: el gancho a los 3 segundos, cuántos siguen hasta la mitad y cuánto tiempo se ve de media.",
  duracion: "Duración real del vídeo en segundos. Meta casi nunca la exporta. Con ella se calcula qué porcentaje del anuncio se ve de media.",
  historico: "Una fila por informe. Pulsa una columna para ordenar y otra vez para invertir. El acumulado no se mueve: suma gasto y compras y recalcula las tasas, no promedia los porcentajes.",
  evolucion: "Tres lecturas, una a la vez: ventas, alcance y vídeo. Cada pestaña compara sus series en la misma gráfica. El punto usa el semáforo de ese día cuando la métrica tiene regla. Un día sin informe no se dibuja como cero.",
  evoVentas: "Gasto y compras en la misma gráfica, cada uno con su eje, para ver si el gasto se mueve con las compras.",
  evoAlcance: "Alcance en el eje izquierdo. Frecuencia y CTR de enlace en el derecho, para ver si al llegar a más gente baja el clic o sube la repetición.",
  evoVideo: "Hook y hold, ambos en porcentaje, con el tiempo medio en segundos. El punto verde, ámbar o rojo es el semáforo de ese día.",
  embudo: "Cada barra es el volumen de ese paso. El porcentaje es respecto al paso anterior, no una media de días.",
  veredicto: "Escalar, variantes, apagar, vigilar o muestra baja. Sale de gasto, CPA, ROAS, frecuencia y carga de la landing.",
  activos: "Solo anuncios que Meta marca como activos en el último informe.",
  gasto: "Dinero invertido en el periodo. Los informes que se solapan en fechas no se suman dos veces.",
  compras: "Compras del sitio web. Si falta esa columna, se usa Resultados.",
  cpa: "Coste por compra: gasto ÷ compras. Verde ≤ 10 €, amarillo hasta 15 €, rojo por encima.",
  roas: "Retorno: valor de compras ÷ gasto de las filas que sí traen ingreso. Un valor, un ROAS o un gasto en 0 o vacío no entra en la división ni tira la media hacia abajo. Verde ≥ 2,50x, amarillo desde 1,50x, rojo por debajo. Un 350% del Excel se lee como 3,50x.",
  alcance: "Personas alcanzadas. En el acumulado es la suma de los días, no el alcance único del periodo.",
  freq: "Veces medias que una persona vio el anuncio. Verde ≤ 1,40, amarillo hasta 1,80, rojo por encima. En el acumulado se usa el último informe, no una media.",
  ctr: "CTR de clic en el enlace, no el de todos los clics. Verde ≥ 2,50%, amarillo desde 1,50%, rojo por debajo.",
  lpv: "Porcentaje de clics en el enlace que llegan a cargar la landing. Verde ≥ 85%, amarillo desde 70%, rojo por debajo.",
  hook: "Hook rate: reproducciones de 3 segundos ÷ impresiones. Mide si paran el scroll, no si ven el anuncio entero. Verde ≥ 30%, amarillo desde 20%, rojo por debajo.",
  hold: "Hold rate: de quienes vieron 3 segundos, cuántos llegan a la mitad (reproducciones al 50% ÷ vistas de 3 s). Si el Excel no trae el 50%, se usa el 75%, ThruPlay o el 100%. Verde ≥ 35%, amarillo desde 20%. El 100% es el cierre y no entra en este número.",
  avgT: "Segundos medios de reproducción. Verde ≥ 5 s, amarillo desde 3 s, rojo por debajo.",
  watch: "Qué parte del vídeo se ve de media: el tiempo medio dividido entre la duración. Un 40% significa que, de un vídeo de 15 s, se ven unos 6 s. Si Meta no trae la duración, escríbela arriba.",
  cpm: "Coste por mil impresiones: gasto ÷ impresiones × 1.000. No es la media de la columna CPM. Un CPM bajo con un hook flojo señala el arranque del vídeo, no la subasta.",
  reacciones: "Reacciones a la publicación ÷ impresiones. Es una señal social, no una compra.",
  calidad: "Clasificación de calidad de Meta. Un guion o un cero no es una nota: Meta aún no tiene muestra.",
  ranking: "Clasificación del porcentaje de conversiones de Meta. Sirve para leer un CPA caro cuando deja de ser «-».",
  edad: "Días desde la fecha de creación del anuncio hasta el último informe, junto a la frecuencia. Un anuncio nuevo con frecuencia baja no está fatigado.",
  cr: "Conversión global: compras ÷ clics en el enlace. La referencia sana es 1–1,5%. Por debajo de 1% queda en rojo.",
  dropoff: "Clics que no llegan a la landing. Verde ≤ 15%, amarillo hasta 30%, por encima es fuga crítica.",
  intent: "Inicios de pago ÷ añadidos al carrito. Si es alto y casi nadie compra, la fricción está en el último paso del checkout. Si es bajo, se cae antes de llegar a pagar.",
  fecha: "Día o rango de ese informe de Meta. Cada fila es un periodo de este anuncio.",
  navCuenta: "Atracción. Impresiones, alcance, CTR y si el vídeo pasa de los 3 segundos.",
  navCreativos: "El anuncio elegido: veredicto, señales, histórico y evolución.",
  navSitio: "Interés y compra. Carga de la landing, carrito, pago y retorno.",
  impr: "Veces que se mostró el anuncio. El alcance es cuántas personas distintas lo vieron.",
  cpc: "Gasto ÷ clics en el enlace. Es el coste del clic, no el de quien espera a que cargue la página.",
  cpv: "Gasto ÷ visitas a la landing. Lo que cuesta una persona que sí esperó la carga.",
  atcRate: "Añadidos al carrito ÷ visitas a la landing. De quienes pisan la web, cuántos muestran intención de compra.",
  fases: "Si el CTR flojea, el fallo es el anuncio. Si la carga se cae, es la página. Si hay carritos y no hay compras, es la oferta o el pago.",
} as const;

export function Tip({ text, children, block, className }: { text: string; children: ReactNode; block?: boolean; className?: string }) {
  const { on } = useHelp();
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState({ top: 0, left: 0, below: false });
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<number | null>(null);
  const id = useId();

  useEffect(() => {
    if (!on) setOpen(false);
  }, [on]);

  useEffect(() => {
    if (!open) return;
    const hide = () => setOpen(false);
    window.addEventListener("scroll", hide, true);
    return () => window.removeEventListener("scroll", hide, true);
  }, [open]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function show() {
    if (!on || !text) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const below = r.top < 96;
      const left = Math.min(Math.max(r.left + r.width / 2, 136), window.innerWidth - 136);
      setBox({ top: below ? r.bottom + 8 : r.top - 8, left, below });
      setOpen(true);
    }, 160);
  }

  function hide() {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  }

  const Tag = block ? "div" : "span";
  return (
    <Tag
      ref={(node) => {
        ref.current = node;
      }}
      className={clsx(block ? "block" : "inline-flex max-w-full", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open &&
        on &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ top: box.top, left: box.left }}
            className={clsx(
              "pointer-events-none fixed z-50 w-64 -translate-x-1/2 rounded-xl bg-logo px-3 py-2 text-left text-xs leading-snug font-medium text-on-logo shadow-sm",
              box.below ? "" : "-translate-y-full",
            )}
          >
            {text}
          </span>,
          document.body,
        )}
    </Tag>
  );
}
