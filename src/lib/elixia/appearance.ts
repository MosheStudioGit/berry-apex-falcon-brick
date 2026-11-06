export type SkinId = "elixia" | "glass" | "luna" | "code" | "trade" | "market";

export type Brand = {
  name: string;
  tag: string;
  letter: string;
  logo: string;
};

export const DEFAULT_BRAND: Brand = {
  name: "Elixia · Meta Intelligence",
  tag: "",
  letter: "E",
  logo: "",
};

export const SKINS: { id: SkinId; label: string; note: string }[] = [
  { id: "elixia", label: "Elixia", note: "El panel actual, en día y en noche." },
  { id: "glass", label: "Cristal", note: "Vidrio translúcido, como una ventana sobre el color." },
  { id: "luna", label: "XP", note: "Cielo y prado, con ventanas claras de día y grafito de noche." },
  { id: "code", label: "Código", note: "Entorno de trabajo: papel de día, fósforo de noche." },
  { id: "trade", label: "Bolsa", note: "Mesa de trading: verde y rojo, cifras en monoespacio." },
  { id: "market", label: "Market", note: "Tablero SaaS, sombras suaves y semáforo claro." },
];

const SKIN_KEY = "elixia_skin";
const BRAND_KEY = "elixia_brand";

export function loadSkin(): SkinId {
  try {
    const s = localStorage.getItem(SKIN_KEY);
    if (s === "glass" || s === "luna" || s === "code" || s === "elixia" || s === "trade" || s === "market") return s;
  } catch {
    /* storage no disponible */
  }
  return "elixia";
}

export function saveSkin(skin: SkinId) {
  localStorage.setItem(SKIN_KEY, skin);
}

export function loadBrand(): Brand {
  try {
    const raw = JSON.parse(localStorage.getItem(BRAND_KEY) || "null") as unknown;
    if (!raw || typeof raw !== "object") return DEFAULT_BRAND;
    const b = raw as Partial<Brand>;
    return {
      name: typeof b.name === "string" && b.name.trim() ? b.name.slice(0, 60) : DEFAULT_BRAND.name,
      tag: typeof b.tag === "string" ? b.tag.slice(0, 80) : "",
      letter: typeof b.letter === "string" && b.letter.trim() ? b.letter.trim().slice(0, 2) : "E",
      logo: typeof b.logo === "string" && b.logo.startsWith("data:image/") ? b.logo : "",
    };
  } catch {
    return DEFAULT_BRAND;
  }
}

export function saveBrand(brand: Brand) {
  localStorage.setItem(BRAND_KEY, JSON.stringify(brand));
}

export function fitLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 128;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("image"));
    img.src = URL.createObjectURL(file);
  });
}
