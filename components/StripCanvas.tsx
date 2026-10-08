"use client";

import { useRef } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import StripPreview from "@/components/StripPreview";
import { useBooth } from "@/lib/store";
import { CSS_FILTERS } from "@/lib/filters";

export default function StripCanvas() {
  const {
    placed,
    selectedSticker,
    selectSticker,
    moveSticker,
    resizeSticker,
    removeSticker,
    texts,
    moveText,
    removeText,
    filter,
  } = useBooth();

  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);
  const draggingText = useRef<string | null>(null);

  function onMove(e: React.PointerEvent) {
    if (!boxRef.current) return;
    if (!dragging.current && !draggingText.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    if (dragging.current) moveSticker(dragging.current, x, y);
    if (draggingText.current) moveText(draggingText.current, x, y);
  }

  function stopDrag() {
    dragging.current = null;
    draggingText.current = null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative w-40"
        onPointerDown={() => selectSticker(null)}
        onPointerMove={onMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        {/* filter shudhu strip er upor, sticker ar text e na */}
        <div style={{ filter: CSS_FILTERS[filter] }}>
          <StripPreview />
        </div>

        {placed.map((p) => (
          <div
            key={p.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              dragging.current = p.id;
              selectSticker(p.id);
            }}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: p.size,
              transform: "translate(-50%, -50%)",
              touchAction: "none",
            }}
            className={`absolute cursor-grab select-none leading-none ${
              selectedSticker === p.id
                ? "rounded outline-2 outline-dashed outline-berry"
                : ""
            }`}
          >
            {p.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.src}
                alt="sticker"
                draggable={false}
                style={{ width: p.size, maxWidth: "none" }}
              />
            ) : (
              p.emoji
            )}
          </div>
        ))}

        {texts.map((t) => (
          <div
            key={t.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              draggingText.current = t.id;
              selectSticker(null);
            }}
            onDoubleClick={() => removeText(t.id)}
            title="Double-click to delete"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              fontSize: t.size,
              color: t.color,
              transform: "translate(-50%, -50%)",
              touchAction: "none",
            }}
            className="absolute cursor-grab select-none whitespace-nowrap leading-none"
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Controls for the selected sticker */}
      <div className="flex h-10 items-center gap-2">
        {selectedSticker ? (
          <>
            <button
              onClick={() => resizeSticker(selectedSticker, -8)}
              aria-label="Smaller"
              className="rounded-full bg-white p-2 shadow"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => resizeSticker(selectedSticker, 8)}
              aria-label="Bigger"
              className="rounded-full bg-white p-2 shadow"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => removeSticker(selectedSticker)}
              aria-label="Delete sticker"
              className="rounded-full bg-white p-2 text-berry shadow"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <p className="text-sm">
            Tap a sticker to move or resize it. Double-click text to delete.
          </p>
        )}
      </div>
    </div>
  );
}