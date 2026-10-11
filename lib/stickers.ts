export type StickerDef = {
  id: string;
  label: string;
  src?: string;
  emoji?: string;
};

export const STARTER_STICKERS: StickerDef[] = [
  { id: "bow", label: "Bow", src: "/stickers/bow.png" },
  { id: "flower", label: "Flower", src: "/stickers/flower.png" },
  { id: "heart", label: "Heart", src: "/stickers/heart.png" },
  { id: "lightning", label: "Lightning", src: "/stickers/lightening.png" },
  { id: "ribbon", label: "Ribbon", src: "/stickers/ribbon.png" },
  { id: "smiley", label: "Smiley", src: "/stickers/smiley.png" },
  { id: "star", label: "Star", src: "/stickers/star.png" },
];