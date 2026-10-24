"use client";

import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import StripCanvas from "@/components/StripCanvas";
import EditorToolbar from "@/components/EditorToolbar";
import StickerMaker from "@/components/StickerMaker";
import { STARTER_STICKERS } from "@/lib/stickers";
import { useBooth } from "@/lib/store";
import type { FilterName } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import { downloadStrip } from "@/lib/renderStrip";

const FILTER_MAP: Record<string, FilterName> = {
  None: "none",
  "B&W": "bw",
  Vintage: "vintage",
  Warm: "warm",
  Cool: "cool",
};

export default function EditorPage() {
  const {
    selected,
    stripSize,
    photos,
    placed,
    texts,
    filter,
    theme,
    strokes,
    cutouts,
    addSticker,
    addImageSticker,
    addText,
    setFilter,
  } = useBooth();
  const [cutPhoto, setCutPhoto] = useState<string | null>(null);

  if (selected.length < stripSize) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="font-heading text-xl">Pick your photos first.</p>
        <Link
          href="/camera"
          className="mt-6 inline-block rounded-full bg-berry px-8 py-3 font-heading text-white"
        >
          Back to camera
        </Link>
      </main>
    );
  }

  const stripPhotos = selected
    .map((id) => photos.find((p) => p.id === id)?.src)
    .filter(Boolean) as string[];

  async function handleDownload() {
    try {
      await downloadStrip({
        photos: stripPhotos,
        stickers: placed,
        texts,
        filter,
        theme: THEMES[theme] ?? THEMES.classic,
        strokes,
      });
    } catch (err) {
      console.error(err);
      alert("Sorry, the download failed. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-center font-heading text-3xl text-berry">
        Decorate your strip
      </h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="flex items-start justify-center rounded-2xl bg-blush/30 p-8">
          <StripCanvas />
        </div>

        <EditorToolbar
          onAddSticker={(id) => {
            const s = STARTER_STICKERS.find((x) => x.id === id);
            if (!s) return;
            if (s.src) addImageSticker(s.src);
            else if (s.emoji) addSticker(s.emoji);
          }}
          onAddText={addText}
          onFilter={(f) => setFilter(FILTER_MAP[f] ?? "none")}
        />
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/camera"
          className="rounded-full bg-blush px-6 py-3 font-heading"
        >
          Back
        </Link>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-full bg-berry px-8 py-3 font-heading text-white shadow-md"
        >
          <Download className="h-5 w-5" />
          Download
        </button>
      </div>

      {/* Cutout stickers */}
      <section className="mt-12 rounded-2xl bg-white p-5 shadow">
        <h2 className="font-heading text-xl text-berry">
          Make a sticker from your photo
        </h2>
        <p className="mt-1 text-sm">
          Pick a photo, remove its background, then add it to your strip or to
          your sticker sheet. The first time can take a minute and needs
          internet.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {stripPhotos.map((src, i) => (
            <button
              key={i}
              onClick={() => setCutPhoto(src)}
              className={`overflow-hidden rounded-xl border-4 ${
                cutPhoto === src ? "border-berry" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} className="h-20 w-28 object-cover" />
            </button>
          ))}
        </div>

        {cutPhoto && (
          <div className="mt-4">
            <StickerMaker key={cutPhoto} photo={cutPhoto} />
          </div>
        )}

        <Link
          href="/sheet"
          className="mt-4 inline-block rounded-full bg-blush px-6 py-2 font-heading"
        >
          Open sticker sheet ({cutouts.length})
        </Link>
      </section>
    </main>
  );
}