import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { SKINS, fitLogo, type Brand, type SkinId } from "@/lib/elixia/appearance";

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold";

export function AppearancePanel({
  brand,
  skin,
  theme,
  onBrand,
  onSkin,
  onTheme,
  onError,
}: {
  brand: Brand;
  skin: SkinId;
  theme: "light" | "dark";
  onBrand: (brand: Brand) => void;
  onSkin: (skin: SkinId) => void;
  onTheme: (theme: "light" | "dark") => void;
  onError: (text: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const field = "mt-1 block min-h-11 w-full rounded-xl border border-line bg-soft px-3 text-sm text-fg";

  return (
    <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
      <h2 className="text-base font-extrabold tracking-tight">Apariencia</h2>
      <p className="mt-1 text-sm text-muted">El nombre y el logo son de este navegador. Cada perfil tiene día y noche.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-xs font-semibold text-muted">
          Nombre
          <input className={field} value={brand.name} maxLength={60} onChange={(e) => onBrand({ ...brand, name: e.target.value })} />
        </label>
        <label className="text-xs font-semibold text-muted">
          Subtítulo
          <input className={field} value={brand.tag} maxLength={80} placeholder="Opcional" onChange={(e) => onBrand({ ...brand, tag: e.target.value })} />
        </label>
        <label className="text-xs font-semibold text-muted">
          Letra del logo
          <input className={field} value={brand.letter} maxLength={2} onChange={(e) => onBrand({ ...brand, letter: e.target.value })} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={clsx(btn, "bg-logo text-on-logo")} onClick={() => fileRef.current?.click()}>
          <ImagePlus className="size-4" />
          Subir logo
        </button>
        {brand.logo && (
          <button type="button" className={clsx(btn, "border border-line bg-soft text-fg")} onClick={() => onBrand({ ...brand, logo: "" })}>
            <Trash2 className="size-4" />
            Quitar logo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            void fitLogo(file)
              .then((logo) => onBrand({ ...brand, logo }))
              .catch(() => onError("No pude leer esa imagen."));
          }}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SKINS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={skin === item.id}
            onClick={() => onSkin(item.id)}
            className={clsx("rounded-xl border p-2 text-left", skin === item.id ? "border-accent bg-accent/10" : "border-line bg-soft")}
          >
            <span className={clsx("skin-swatch", `skin-swatch-${item.id}`)} />
            <span className="mt-2 block text-sm font-bold">{item.label}</span>
            <span className="mt-0.5 block text-xs text-muted">{item.note}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-soft p-1" role="group" aria-label="Día o noche">
        <button type="button" aria-pressed={theme === "light"} className={clsx("min-h-11 rounded-xl text-sm font-semibold", theme === "light" ? "bg-surface text-fg shadow-sm" : "text-muted")} onClick={() => onTheme("light")}>
          Día
        </button>
        <button type="button" aria-pressed={theme === "dark"} className={clsx("min-h-11 rounded-xl text-sm font-semibold", theme === "dark" ? "bg-surface text-fg shadow-sm" : "text-muted")} onClick={() => onTheme("dark")}>
          Noche
        </button>
      </div>
    </section>
  );
}
