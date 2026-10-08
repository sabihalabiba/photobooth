"use client";

import { X } from "lucide-react";
import { MAX_PHOTOS, useBooth } from "@/lib/store";

export default function PhotoTray() {
  const { photos, selected, toggleSelect, removePhoto } = useBooth();

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
        const photo = photos[i];
        if (!photo) {
          return (
            <div
              key={i}
              className="aspect-[4/3] rounded-lg border-2 border-dashed border-blush"
            />
          );
        }
        const order = selected.indexOf(photo.id);
        return (
          <div key={photo.id} className="relative">
            <button
              onClick={() => toggleSelect(photo.id)}
              className={`block w-full overflow-hidden rounded-lg border-4 ${
                order >= 0 ? "border-berry" : "border-transparent"
              }`}
            >
              <img src={photo.src} alt="" className="aspect-[4/3] w-full object-cover" />
            </button>
            {order >= 0 && (
              <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-berry text-sm font-semibold text-white">
                {order + 1}
              </span>
            )}
            <button
              onClick={() => removePhoto(photo.id)}
              aria-label="Delete photo"
              className="absolute right-1 top-1 rounded-full bg-white p-1 shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}