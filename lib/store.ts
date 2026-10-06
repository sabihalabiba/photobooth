import { create } from "zustand";

export type Photo = { id: string; src: string };

export const MAX_PHOTOS = 8;

type BoothState = {
  stripSize: 3 | 4;
  photos: Photo[];
  selected: string[]; // photo ids, in the order picked
  setStripSize: (n: 3 | 4) => void;
  addPhoto: (src: string) => void;
  removePhoto: (id: string) => void;
  toggleSelect: (id: string) => void;
};

export const useBooth = create<BoothState>((set) => ({
  stripSize: 3,
  photos: [],
  selected: [],

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
}));