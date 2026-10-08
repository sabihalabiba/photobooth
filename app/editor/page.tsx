"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import StripCanvas from "@/components/StripCanvas";
import EditorToolbar from "@/components/EditorToolbar";
import { STARTER_STICKERS } from "@/lib/stickers";
import { useBooth } from "@/lib/store";

export default function EditorPage() {
  const { selected, stripSize, addSticker } = useBooth();

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
            if (s) addSticker(s.emoji);
          }}
        />
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/camera"
          className="rounded-full bg-blush px-6 py-3 font-heading"
        >
          Back
        </Link>
        <button className="flex items-center gap-2 rounded-full bg-berry px-8 py-3 font-heading text-white shadow-md">
          <Download className="h-5 w-5" />
          Download
        </button>
      </div>
    </main>
  );
}