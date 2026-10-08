"use client";

import { useRef } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import StripPreview from "@/components/StripPreview";
import { useBooth } from "@/lib/store";

export default function StripCanvas() {
  const {
    placed,
    selectedSticker,
    selectSticker,
    moveSticker,
    resizeSticker,
    removeSticker,
  } = useBooth();

  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);

  function onMove(e: React.PointerEvent) {
    if (!dragging.current || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    moveSticker(
      dragging.current,
      Math.min(100, Math.max(0, x)),
      Math.min(100, Math.max(0, y))
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative w-40"
        onPointerDown={() => selectSticker(null)}
        onPointerMove={onMove}
        onPointerUp={() => (dragging.current = null)}
        onPointerLeave={() => (dragging.current = null)}
      >
        <StripPreview />

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
            {p.emoji}
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
          <p className="text-sm">Tap a sticker to move or resize it.</p>
        )}
      </div>
    </div>
  );
}