"use client";

import { useBooth } from "@/lib/store";
import { THEMES } from "@/lib/themes";

export default function StripPreview() {
  const { stripSize, photos, selected, theme: themeId } = useBooth();
  const theme = THEMES[themeId];

  return (
    <div
      className="relative mx-auto flex w-40 flex-col gap-2 self-start rounded-lg p-3 shadow-lg"
      style={{
        background: `linear-gradient(to bottom, ${theme.bg[0]}, ${theme.bg[1]})`,
      }}
    >
      {Array.from({ length: stripSize }).map((_, i) => {
        const photo = photos.find((p) => p.id === selected[i]);
        return (
          <div
            key={i}
            className="aspect-[4/3] overflow-hidden rounded bg-blush/40"
            style={{
              border: `${theme.photoBorderWidth}px solid ${theme.photoBorder}`,
            }}
          >
            {photo && (
              <img src={photo.src} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        );
      })}
      <p
        className="text-center text-xs"
        style={{ color: theme.textColor, fontFamily: theme.font }}
      >
        {theme.footer}
      </p>
      {theme.overlay && (
        <img
          src={theme.overlay}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}