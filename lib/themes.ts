export type ThemeId = "classic" | "y2k" | "vintage" | "cute" | "minimal" | "scrapbook";

export type Theme = {
  id: ThemeId;
  name: string;
  bg: [string, string];      // top to bottom gradient (same color = solid)
  photoBorder: string;
  photoBorderWidth: number;  // px
  textColor: string;
  font: string;              // generic family, preview ar canvas duto-te kaj kore
  footer: string;
  overlay?: string;          // Labiba er frame PNG, jemon "/themes/y2k.png"
};

export const THEMES: Record<ThemeId, Theme> = {
  classic: { id: "classic", name: "Classic", bg: ["#ffffff", "#ffffff"], photoBorder: "#000000", photoBorderWidth: 0, textColor: "#000000", font: "sans-serif", footer: "photobooth studio" },
  y2k: { id: "y2k", name: "Y2K", bg: ["#ff9de2", "#a0c4ff"], photoBorder: "#ffffff", photoBorderWidth: 3, textColor: "#4b007d", font: "monospace", footer: "~ photobooth studio ~" },
  vintage: { id: "vintage", name: "Vintage", bg: ["#f3e5c8", "#e6d3a8"], photoBorder: "#6b4a2b", photoBorderWidth: 2, textColor: "#5a3b1e", font: "serif", footer: "photobooth studio" },
  cute: { id: "cute", name: "Cute", bg: ["#ffd6e8", "#fff0f6"], photoBorder: "#ff7eb6", photoBorderWidth: 3, textColor: "#d6336c", font: "cursive", footer: "photobooth studio" },
  minimal: { id: "minimal", name: "Minimal", bg: ["#ffffff", "#ffffff"], photoBorder: "#111111", photoBorderWidth: 1, textColor: "#111111", font: "sans-serif", footer: "photobooth studio" },
  scrapbook: { id: "scrapbook", name: "Scrapbook", bg: ["#f6ead7", "#f6ead7"], photoBorder: "#c97b4a", photoBorderWidth: 3, textColor: "#7a4a2a", font: "cursive", footer: "photobooth studio" },
};

export const THEME_LIST = Object.values(THEMES);