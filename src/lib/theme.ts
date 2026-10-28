export const THEMES = ["chipre", "paramo", "tinto", "cafetal", "niebla", "nevado", "cable", "catedral"] as const;
export type Theme = (typeof THEMES)[number];
/** Chipre (the Manizales sunset viewpoint) is what a first-time visitor sees; a stored choice always wins (THEME_INIT_SCRIPT). */
export const DEFAULT_THEME: Theme = "chipre";
export const isTheme = (v: unknown): v is Theme => THEMES.includes(v as Theme);

/** Ids stored by earlier versions, mapped to their successors section 6). */
export const LEGACY: Record<string, Theme> = { dusk: "chipre", dawn: "paramo", night: "cable" };
/** Resolves a stored value to a current theme id: legacy ids migrate, anything unknown becomes the default. */
export const resolveTheme = (v: unknown): Theme => (isTheme(v) ? v : typeof v === "string" && Object.hasOwn(LEGACY, v) ? LEGACY[v] : DEFAULT_THEME);

type Meta = { name: string; tagline: { en: string; es: string }; swatch: [string, string, string]; emotion: string };
/** Proper-noun names (identical in both languages), taglines, a three-colour swatch (bg, accent, third) and the emotion each theme carries.
 * Lives here, not in the i18n files, so the menu previews every theme without depending on the active one. */
export const THEME_META: Record<Theme, Meta> = {
  chipre: { name: "Chipre", tagline: { en: "Sunset over the viewpoint", es: "El atardecer del mirador" }, swatch: ["#0f1216", "#e9a55c", "#ff7a45"], emotion: "warmth, trust" },
  paramo: { name: "Páramo", tagline: { en: "Morning above the clouds", es: "La mañana sobre las nubes" }, swatch: ["#f7f1e6", "#8a4a1c", "#1d6b62"], emotion: "clarity, calm focus" },
  tinto: { name: "Tinto", tagline: { en: "A black coffee to talk it over", es: "Un tinto para conversarlo" }, swatch: ["#140e0b", "#e3a66c", "#ff6d4a"], emotion: "closeness, hospitality" },
  cafetal: { name: "Cafetal", tagline: { en: "Jade rows of the coffee farm", es: "Surcos de jade del cafetal" }, swatch: ["#0b1512", "#5cd6a8", "#e6bd6a"], emotion: "restful growth" },
  niebla: { name: "Niebla", tagline: { en: "When the fog comes down the hills", es: "Cuando la niebla baja de las lomas" }, swatch: ["#15161b", "#dcb6d6", "#9cc8bf"], emotion: "quiet, reflective" },
  nevado: { name: "Nevado", tagline: { en: "Ice light of the Ruiz", es: "Luz de hielo del Ruiz" }, swatch: ["#0a1320", "#bfe0ff", "#4aa3ff"], emotion: "precision, composure" },
  cable: { name: "Cable", tagline: { en: "The cable car at night", es: "El cable de noche" }, swatch: ["#0d1226", "#f2b866", "#b6a0ff"], emotion: "curiosity, play" },
  catedral: { name: "Catedral", tagline: { en: "Stone, gold and stained glass", es: "Piedra, oro y vitral" }, swatch: ["#111119", "#f0c35c", "#93abff"], emotion: "character, craft" },
};

export const currentTheme = (): Theme => resolveTheme(document.documentElement.dataset.theme);

export function syncThemeColor() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || THEME_META[currentTheme()].swatch[0];
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta && bg) meta.content = bg;
}

/** Applies and persists a theme, with a circular View Transition reveal when the browser supports it. */
export function applyTheme(theme: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const apply = () => {
    root.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { /* storage unavailable */ }
    syncThemeColor();
    window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  };
  const svt = (document as Document & { startViewTransition?: (cb: () => void) => { ready?: Promise<unknown> } }).startViewTransition?.bind(document);
  if (!svt || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
  const x = origin?.x ?? innerWidth - 40, y = origin?.y ?? 30;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = svt(apply);
  t.ready?.then(() => root.animate(
    { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
    { duration: 600, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
  )).catch(() => {});
}

/** Inline in <head> so the saved theme is applied before first paint; legacy ids migrate and the stored value is rewritten once. */
export const THEME_INIT_SCRIPT = `try{var L=${JSON.stringify(LEGACY)},T=${JSON.stringify(THEMES)},t=localStorage.getItem("theme"),r=T.indexOf(t)>-1?t:(t&&L.hasOwnProperty(t)?L[t]:"${DEFAULT_THEME}");document.documentElement.dataset.theme=r;if(t&&t!==r)localStorage.setItem("theme",r)}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}"}`;
