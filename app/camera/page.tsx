"use client";

import Link from "next/link";
import CameraView from "@/components/CameraView";
import PhotoTray from "@/components/PhotoTray";
import StripPreview from "@/components/StripPreview";
import { useBooth } from "@/lib/store";

export default function CameraPage() {
  const { stripSize, setStripSize, selected } = useBooth();
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
        <CameraView />
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