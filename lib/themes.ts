export type ThemeId = "classic" | "y2k" | "vintage" | "cute" | "minimal" | "scrapbook";

export type PhotoWindow = { x: number; y: number; w: number; h: number };

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
  windows?: PhotoWindow[];   // optional: exact photo windows (640x1480 px) for 3-photo strips
};

export const THEMES: Record<ThemeId, Theme> = {
  classic: { id: "classic", name: "Classic", bg: ["#ffffff", "#ffffff"], photoBorder: "#000000", photoBorderWidth: 0, textColor: "#000000", font: '"Patrick Hand", sans-serif', footer: "photobooth studio" },
  y2k: {
    id: "y2k", name: "Y2K", bg: ["#780204", "#780204"], photoBorder: "#ffffff", photoBorderWidth: 0, textColor: "#ffffff", font: "monospace", footer: "",
    overlay: "/themes/y2k.png",
    windows: [
      { x: 39, y: 34, w: 562, h: 425 },
      { x: 39, y: 476, w: 562, h: 423 },
      { x: 39, y: 916, w: 562, h: 424 },
    ],
  },
  vintage: { id: "vintage", name: "Vintage", bg: ["#f3e5c8", "#e6d3a8"], photoBorder: "#6b4a2b", photoBorderWidth: 2, textColor: "#5a3b1e", font: '"Special Elite", serif', footer: "photobooth studio", overlay: "/themes/vintage.png" },
  cute: { id: "cute", name: "Cute", bg: ["#ffd6e8", "#fff0f6"], photoBorder: "#ff7eb6", photoBorderWidth: 3, textColor: "#d6336c", font: '"Gaegu", cursive', footer: "photobooth studio", overlay: "/themes/cute.png" },
  minimal: { id: "minimal", name: "Minimal", bg: ["#ffffff", "#ffffff"], photoBorder: "#111111", photoBorderWidth: 1, textColor: "#111111", font: '"Patrick Hand", sans-serif', footer: "photobooth studio", overlay: "/themes/minimal.png" },
  scrapbook: { id: "scrapbook", name: "Scrapbook", bg: ["#f6ead7", "#f6ead7"], photoBorder: "#c97b4a", photoBorderWidth: 3, textColor: "#7a4a2a", font: '"Caveat", cursive', footer: "photobooth studio" },
};

export const THEME_LIST = Object.values(THEMES);