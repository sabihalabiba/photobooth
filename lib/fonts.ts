export type TextFontId = "bubble" | "classic" | "typewriter" | "meme" | "literature";

export type TextFontDef = {
  id: TextFontId;
  label: string;
  family: string;
  weight: number;
  style: "normal" | "italic";
  uppercase?: boolean;
  outline?: boolean; // white text with a black outline (meme style)
};

export const TEXT_FONTS: TextFontDef[] = [
  { id: "bubble", label: "Bubble", family: '"Chewy", cursive', weight: 400, style: "normal" },
  { id: "classic", label: "Classic", family: '"Montserrat", sans-serif', weight: 700, style: "normal" },
  { id: "typewriter", label: "Typewriter", family: '"Special Elite", monospace', weight: 400, style: "normal" },
  { id: "meme", label: "Meme", family: '"Anton", Impact, sans-serif', weight: 400, style: "normal", uppercase: true, outline: true },
  { id: "literature", label: "Literature", family: '"Playfair Display", serif', weight: 600, style: "italic" },
];

export const FONT_BY_ID = Object.fromEntries(
  TEXT_FONTS.map((f) => [f.id, f])
) as Record<TextFontId, TextFontDef>;

export function canvasFont(id: TextFontId, size: number) {
  const f = FONT_BY_ID[id] ?? FONT_BY_ID.classic;
  return `${f.style} ${f.weight} ${size}px ${f.family}`;
}