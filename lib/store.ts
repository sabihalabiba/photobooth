import { create } from "zustand";
import type { ThemeId } from "./themes";
import type { TextFontId } from "./fonts";

export type Photo = { id: string; src: string };
export type FilterName = "none" | "bw" | "vintage" | "warm" | "cool";

export type PlacedSticker = {
  id: string;
  emoji: string;
  src?: string;
  x: number;
  y: number;
  size: number;
  rotation: number; // degrees
};

export type PlacedText = {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font: TextFontId;
  rotation: number; // degrees
};

export type Stroke = {
  id: string;
  color: string;
  width: number; // px, 160px wide preview er hishebe
  points: { x: number; y: number }[]; // percent
};

export const MAX_PHOTOS = 8;

const clampAngle = (d: number) => Math.max(-180, Math.min(180, Math.round(d)));

type BoothState = {
  stripSize: 3 | 4;
  photos: Photo[];
  selected: string[];
  placed: PlacedSticker[];
  selectedSticker: string | null;
  texts: PlacedText[];
  selectedText: string | null;
  textFont: TextFontId;
  filter: FilterName;
  theme: ThemeId;
  strokes: Stroke[];
  redoStrokes: Stroke[];
  drawMode: boolean;
  brushColor: string;
  brushSize: number;
  cutouts: string[]; // bg-removed sticker image, sticker sheet er jonno

  setStripSize: (n: 3 | 4) => void;
  addPhoto: (src: string) => void;
  removePhoto: (id: string) => void;
  toggleSelect: (id: string) => void;

  addSticker: (emoji: string) => void;
  addImageSticker: (src: string) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  resizeSticker: (id: string, delta: number) => void;
  rotateSticker: (id: string, deg: number) => void;
  removeSticker: (id: string) => void;
  selectSticker: (id: string | null) => void;

  addText: (text: string) => void;
  moveText: (id: string, x: number, y: number) => void;
  resizeText: (id: string, delta: number) => void;
  rotateText: (id: string, deg: number) => void;
  removeText: (id: string) => void;
  selectText: (id: string | null) => void;
  setTextFont: (f: TextFontId) => void;
  clearSelection: () => void;

  setFilter: (f: FilterName) => void;
  setTheme: (t: ThemeId) => void;

  setDrawMode: (on: boolean) => void;
  setBrushColor: (c: string) => void;
  setBrushSize: (n: number) => void;
  addStroke: (s: Stroke) => void;
  undo: () => void;
  redo: () => void;
  clearStrokes: () => void;

  addCutout: (src: string) => void;
};

export const useBooth = create<BoothState>((set) => ({
  stripSize: 3,
  photos: [],
  selected: [],
  placed: [],
  selectedSticker: null,
  texts: [],
  selectedText: null,
  textFont: "classic",
  filter: "none",
  theme: "classic",
  strokes: [],
  redoStrokes: [],
  drawMode: false,
  brushColor: "#ff4d94",
  brushSize: 3,
  cutouts: [],

  setStripSize: (n) =>
    set((s) => ({ stripSize: n, selected: s.selected.slice(0, n) })),

  addPhoto: (src) =>
    set((s) =>
      s.photos.length >= MAX_PHOTOS
        ? s
        : { photos: [...s.photos, { id: crypto.randomUUID(), src }] }
    ),

  removePhoto: (id) =>
    set((s) => ({
      photos: s.photos.filter((p) => p.id !== id),
      selected: s.selected.filter((x) => x !== id),
    })),

  toggleSelect: (id) =>
    set((s) => {
      if (s.selected.includes(id))
        return { selected: s.selected.filter((x) => x !== id) };
      if (s.selected.length >= s.stripSize) return s;
      return { selected: [...s.selected, id] };
    }),

  addSticker: (emoji) =>
    set((s) => {
      const id = crypto.randomUUID();
      return {
        placed: [
          ...s.placed,
          {
            id,
            emoji,
            x: 50 + (Math.random() - 0.5) * 20,
            y: 50 + (Math.random() - 0.5) * 30,
            size: 36,
            rotation: 0,
          },
        ],
        selectedSticker: id,
        selectedText: null,
      };
    }),

  addImageSticker: (src) =>
    set((s) => {
      const id = crypto.randomUUID();
      return {
        placed: [
          ...s.placed,
          { id, emoji: "", src, x: 50, y: 50, size: 60, rotation: 0 },
        ],
        selectedSticker: id,
        selectedText: null,
      };
    }),

  moveSticker: (id, x, y) =>
    set((s) => ({
      placed: s.placed.map((p) => (p.id === id ? { ...p, x, y } : p)),
    })),

  resizeSticker: (id, delta) =>
    set((s) => ({
      placed: s.placed.map((p) =>
        p.id === id
          ? { ...p, size: Math.min(120, Math.max(16, p.size + delta)) }
          : p
      ),
    })),

  rotateSticker: (id, deg) =>
    set((s) => ({
      placed: s.placed.map((p) =>
        p.id === id ? { ...p, rotation: clampAngle(deg) } : p
      ),
    })),

  removeSticker: (id) =>
    set((s) => ({
      placed: s.placed.filter((p) => p.id !== id),
      selectedSticker: null,
    })),

  selectSticker: (id) =>
    set((s) => ({
      selectedSticker: id,
      selectedText: id ? null : s.selectedText,
    })),

  addText: (text) =>
    set((s) => {
      const id = crypto.randomUUID();
      return {
        texts: [
          ...s.texts,
          {
            id,
            text,
            x: 50,
            y: 50,
            size: 16,
            color: "#000000",
            font: s.textFont,
            rotation: 0,
          },
        ],
        selectedText: id,
        selectedSticker: null,
      };
    }),

  moveText: (id, x, y) =>
    set((s) => ({
      texts: s.texts.map((t) => (t.id === id ? { ...t, x, y } : t)),
    })),

  resizeText: (id, delta) =>
    set((s) => ({
      texts: s.texts.map((t) =>
        t.id === id
          ? { ...t, size: Math.min(48, Math.max(8, t.size + delta)) }
          : t
      ),
    })),

  rotateText: (id, deg) =>
    set((s) => ({
      texts: s.texts.map((t) =>
        t.id === id ? { ...t, rotation: clampAngle(deg) } : t
      ),
    })),

  removeText: (id) =>
    set((s) => ({
      texts: s.texts.filter((t) => t.id !== id),
      selectedText: s.selectedText === id ? null : s.selectedText,
    })),

  selectText: (id) =>
    set((s) => ({
      selectedText: id,
      selectedSticker: id ? null : s.selectedSticker,
    })),

  // changes the font for new text, and for the selected text if there is one
  setTextFont: (f) =>
    set((s) => ({
      textFont: f,
      texts: s.selectedText
        ? s.texts.map((t) => (t.id === s.selectedText ? { ...t, font: f } : t))
        : s.texts,
    })),

  clearSelection: () => set({ selectedSticker: null, selectedText: null }),

  setFilter: (f) => set({ filter: f }),
  setTheme: (t) => set({ theme: t }),

  setDrawMode: (on) => set({ drawMode: on }),
  setBrushColor: (c) => set({ brushColor: c }),
  setBrushSize: (n) => set({ brushSize: n }),

  addStroke: (stroke) =>
    set((s) => ({ strokes: [...s.strokes, stroke], redoStrokes: [] })),

  undo: () =>
    set((s) => {
      if (!s.strokes.length) return s;
      const last = s.strokes[s.strokes.length - 1];
      return {
        strokes: s.strokes.slice(0, -1),
        redoStrokes: [...s.redoStrokes, last],
      };
    }),

  redo: () =>
    set((s) => {
      if (!s.redoStrokes.length) return s;
      const last = s.redoStrokes[s.redoStrokes.length - 1];
      return {
        strokes: [...s.strokes, last],
        redoStrokes: s.redoStrokes.slice(0, -1),
      };
    }),

  clearStrokes: () => set({ strokes: [], redoStrokes: [] }),

  addCutout: (src) => set((s) => ({ cutouts: [...s.cutouts, src] })),
}));