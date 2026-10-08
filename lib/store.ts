import { create } from "zustand";

export type Photo = { id: string; src: string };

export type FilterName = "none" | "bw" | "vintage" | "warm" | "cool";

export type PlacedSticker = {
  id: string;
  emoji: string; // image sticker hole "" thake
  src?: string; // cutout sticker er image (data URL)
  x: number; // percent across the strip
  y: number; // percent down the strip
  size: number; // px
};

export type PlacedText = {
  id: string;
  text: string;
  x: number; // percent
  y: number; // percent
  size: number; // px
  color: string;
};

export const MAX_PHOTOS = 8;

type BoothState = {
  stripSize: 3 | 4;
  photos: Photo[];
  selected: string[]; // photo ids, in the order picked
  placed: PlacedSticker[];
  selectedSticker: string | null;
  texts: PlacedText[];
  filter: FilterName;

  setStripSize: (n: 3 | 4) => void;
  addPhoto: (src: string) => void;
  removePhoto: (id: string) => void;
  toggleSelect: (id: string) => void;

  addSticker: (emoji: string) => void;
  addImageSticker: (src: string) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  resizeSticker: (id: string, delta: number) => void;
  removeSticker: (id: string) => void;
  selectSticker: (id: string | null) => void;

  addText: (text: string) => void;
  moveText: (id: string, x: number, y: number) => void;
  removeText: (id: string) => void;

  setFilter: (f: FilterName) => void;
};

export const useBooth = create<BoothState>((set) => ({
  stripSize: 3,
  photos: [],
  selected: [],
  placed: [],
  selectedSticker: null,
  texts: [],
  filter: "none",

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
          },
        ],
        selectedSticker: id,
      };
    }),

  addImageSticker: (src) =>
    set((s) => {
      const id = crypto.randomUUID();
      return {
        placed: [...s.placed, { id, emoji: "", src, x: 50, y: 50, size: 90 }],
        selectedSticker: id,
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

  removeSticker: (id) =>
    set((s) => ({
      placed: s.placed.filter((p) => p.id !== id),
      selectedSticker: null,
    })),

  selectSticker: (id) => set({ selectedSticker: id }),

  addText: (text) =>
    set((s) => ({
      texts: [
        ...s.texts,
        {
          id: crypto.randomUUID(),
          text,
          x: 50,
          y: 50,
          size: 28,
          color: "#000000",
        },
      ],
    })),

  moveText: (id, x, y) =>
    set((s) => ({
      texts: s.texts.map((t) => (t.id === id ? { ...t, x, y } : t)),
    })),

  removeText: (id) =>
    set((s) => ({ texts: s.texts.filter((t) => t.id !== id) })),

  setFilter: (f) => set({ filter: f }),
}));