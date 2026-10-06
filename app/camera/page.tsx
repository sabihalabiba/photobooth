"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, FlipHorizontal } from "lucide-react";
import PhotoTray from "@/components/PhotoTray";
import StripPreview from "@/components/StripPreview";
import { MAX_PHOTOS, useBooth } from "@/lib/store";

// TEMPORARY: makes a fake colored photo. Toshrif replaces this with the real camera.
function fakePhoto(n: number) {
  const colors = ["#FFC8DD", "#BDE0FE", "#FFAFCC", "#CDB4DB", "#A2D2FF"];
  const c = colors[n % colors.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='${c}'/><text x='50%' y='50%' font-size='80' text-anchor='middle' dominant-baseline='middle' fill='white'>${n + 1}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function CameraPage() {
  const { stripSize, setStripSize, photos, selected, addPhoto } = useBooth();
  const [mirror, setMirror] = useState(true);

  const full = photos.length >= MAX_PHOTOS;
  const ready = selected.length === stripSize;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-center font-heading text-3xl text-berry">
        Take your photos
      </h1>

      {/* Strip choice */}
      <div className="mt-6 flex justify-center gap-3">
        {([3, 4] as const).map((n) => (
          <button
            key={n}
            onClick={() => setStripSize(n)}
            className={`rounded-full px-6 py-2 font-heading ${
              stripSize === n ? "bg-berry text-white" : "bg-blush text-ink"
            }`}
          >
            {n} photos
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto]">
        {/* Camera area */}
        <div>
          {/* Toshrif replaces this box with <CameraView /> */}
          <div
            className={`flex aspect-[4/3] items-center justify-center rounded-2xl bg-ink/90 text-cream ${
              mirror ? "-scale-x-100" : ""
            }`}
          >
            <span className={mirror ? "-scale-x-100" : ""}>Camera preview</span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6">
            <button
              onClick={() => setMirror(!mirror)}
              aria-label="Mirror"
              className="rounded-full bg-blush p-3"
            >
              <FlipHorizontal className="h-5 w-5" />
            </button>
            <button
              onClick={() => addPhoto(fakePhoto(photos.length))}
              disabled={full}
              aria-label="Take photo"
              className="rounded-full bg-berry p-5 text-white shadow-lg transition hover:scale-105 disabled:opacity-40"
            >
              <Camera className="h-8 w-8" />
            </button>
            <span className="w-16 font-heading text-lg">
              {photos.length}/{MAX_PHOTOS}
            </span>
          </div>
        </div>

        {/* Strip preview */}
        <StripPreview />
      </div>

      {/* Tray */}
      <section className="mt-8">
        <p className="mb-2 text-sm">
          Tap {stripSize} photos to put them on your strip ({selected.length}/
          {stripSize} picked).
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