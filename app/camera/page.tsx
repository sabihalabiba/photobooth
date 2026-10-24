"use client";

import { useEffect } from "react";
import Link from "next/link";
import CameraView from "@/components/CameraView";
import PhotoTray from "@/components/PhotoTray";
import StripPreview from "@/components/StripPreview";
import { useBooth } from "@/lib/store";

const STRIP_SIZE = 3;

export default function CameraPage() {
  const { stripSize, setStripSize, selected } = useBooth();

  // the strip is always 3 photos
  useEffect(() => {
    if (stripSize !== STRIP_SIZE) setStripSize(STRIP_SIZE);
  }, [stripSize, setStripSize]);

  const ready = selected.length === STRIP_SIZE;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-center font-heading text-3xl text-berry">
        Take your photos
      </h1>
      <p className="mt-2 text-center text-sm">
        Take up to 8 photos, then pick your 3 favorites.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto]">
        <CameraView />
        <StripPreview />
      </div>

      {/* Tray */}
      <section className="mt-8">
        <p className="mb-2 text-sm">
          Tap {STRIP_SIZE} photos to put them on your strip ({selected.length}/
          {STRIP_SIZE} picked).
        </p>
        <PhotoTray />
      </section>

      {/* Continue */}
      <div className="mt-8 text-center">
        <Link
          href="/editor"
          aria-disabled={!ready}
          className={`inline-block rounded-full px-8 py-3 font-heading text-lg text-white ${
            ready ? "bg-berry" : "pointer-events-none bg-berry/40"
          }`}
        >
          Continue
        </Link>
      </div>
    </main>
  );
}