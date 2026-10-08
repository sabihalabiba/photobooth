"use client";

import { useBooth } from "@/lib/store";

export default function StripPreview() {
  const { stripSize, photos, selected } = useBooth();

  return (
    <div className="mx-auto flex w-40 flex-col gap-2 self-start rounded-lg bg-white p-3 shadow-lg">
      {Array.from({ length: stripSize }).map((_, i) => {
        const photo = photos.find((p) => p.id === selected[i]);
        return (
          <div
            key={i}
            className="aspect-[4/3] overflow-hidden rounded bg-blush/40"
          >
            {photo && (
              <img src={photo.src} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        );
      })}
      <p className="text-center font-heading text-xs">photobooth studio</p>
    </div>
  );
}