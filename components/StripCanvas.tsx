"use client";

import { useCallback, useEffect, useRef } from "react";
import { Minus, Plus, RotateCw, Trash2 } from "lucide-react";
import StripPreview from "@/components/StripPreview";
import { useBooth } from "@/lib/store";
import type { Stroke } from "@/lib/store";
import { CSS_FILTERS } from "@/lib/filters";
import { drawStrokes } from "@/lib/drawStrokes";
import { FONT_BY_ID } from "@/lib/fonts";

function DrawLayer() {
  const { strokes, drawMode, brushColor, brushSize, addStroke } = useBooth();
  const ref = useRef<HTMLCanvasElement>(null);
  const current = useRef<Stroke | null>(null);

  const paint = useCallback(() => {
    const c = ref.current;
    if (!c) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    const dpr = 2;
    c.width = w * dpr;
    c.height = h * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    drawStrokes(ctx, w, h, current.current ? [...strokes, current.current] : strokes);
  }, [strokes]);

  useEffect(() => {
    paint();
  }, [paint]);

  function pt(e: React.PointerEvent) {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    };
  }

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      style={{
        pointerEvents: drawMode ? "auto" : "none",
        cursor: drawMode ? "crosshair" : "default",
        touchAction: "none",
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        current.current = {
          id: crypto.randomUUID(),
          color: brushColor,
          width: brushSize,
          points: [pt(e)],
        };
        paint();
      }}
      onPointerMove={(e) => {
        if (!current.current) return;
        current.current.points.push(pt(e));
        paint();
      }}
      onPointerUp={() => {
        if (current.current) addStroke(current.current);
        current.current = null;
      }}
    />
  );
}

export default function StripCanvas() {
  const {
    placed,
    selectedSticker,
    selectSticker,
    moveSticker,
    resizeSticker,
    rotateSticker,
    removeSticker,
    texts,
    selectedText,
    selectText,
    moveText,
    resizeText,
    rotateText,
    removeText,
    clearSelection,
    filter,
    drawMode,
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

  const itemPointer = drawMode ? "none" : "auto";

  // what is selected right now (a sticker or a text)?
  const selSticker = placed.find((p) => p.id === selectedSticker);
  const selText = texts.find((t) => t.id === selectedText);
  const selKind = selSticker ? "sticker" : selText ? "text" : null;
  const angle = selSticker?.rotation ?? selText?.rotation ?? 0;

  function setAngle(deg: number) {
    if (selSticker) rotateSticker(selSticker.id, deg);
    else if (selText) rotateText(selText.id, deg);
  }
  function resize(delta: number) {
    if (selSticker) resizeSticker(selSticker.id, delta);
    else if (selText) resizeText(selText.id, delta > 0 ? 2 : -2);
  }
  function remove() {
    if (selSticker) removeSticker(selSticker.id);
    else if (selText) removeText(selText.id);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative w-40"
        onPointerDown={() => clearSelection()}
        onPointerMove={onMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        <div style={{ filter: CSS_FILTERS[filter] }}>
          <StripPreview />
        </div>

        <DrawLayer />

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
              transform: `translate(-50%, -50%) rotate(${p.rotation ?? 0}deg)`,
              touchAction: "none",
              pointerEvents: itemPointer,
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

        {texts.map((t) => {
          const f = FONT_BY_ID[t.font] ?? FONT_BY_ID.classic;
          return (
            <div
              key={t.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                draggingText.current = t.id;
                selectText(t.id);
              }}
              onDoubleClick={() => removeText(t.id)}
              title="Double-click to delete"
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                fontSize: t.size,
                color: f.outline ? "#ffffff" : t.color,
                fontFamily: f.family,
                fontWeight: f.weight,
                fontStyle: f.style,
                textTransform: f.uppercase ? "uppercase" : "none",
                WebkitTextStroke: f.outline ? "0.6px #000000" : undefined,
                paintOrder: f.outline ? "stroke fill" : undefined,
                transform: `translate(-50%, -50%) rotate(${t.rotation ?? 0}deg)`,
                touchAction: "none",
                pointerEvents: itemPointer,
              }}
              className={`absolute cursor-grab select-none whitespace-nowrap leading-none ${
                selectedText === t.id
                  ? "rounded outline-2 outline-dashed outline-berry"
                  : ""
              }`}
            >
              {t.text}
            </div>
          );
        })}
      </div>

      {/* Controls for the selected sticker or text */}
      <div className="flex min-h-[5.5rem] flex-col items-center justify-start gap-3">
        {selKind ? (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => resize(-8)}
                aria-label="Smaller"
                className="rounded-full bg-white p-2 shadow"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => resize(8)}
                aria-label="Bigger"
                className="rounded-full bg-white p-2 shadow"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={remove}
                aria-label="Delete"
                className="rounded-full bg-white p-2 text-berry shadow"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCw className="h-4 w-4 shrink-0 text-berry" />
              <button
                onClick={() => setAngle(angle - 5)}
                aria-label="Rotate left"
                className="rounded-full bg-white px-2 py-1 shadow"
              >
                -5°
              </button>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                aria-label="Angle"
                className="w-28"
              />
              <button
                onClick={() => setAngle(angle + 5)}
                aria-label="Rotate right"
                className="rounded-full bg-white px-2 py-1 shadow"
              >
                +5°
              </button>
              <button
                onClick={() => setAngle(0)}
                className="rounded-full bg-blush px-2 py-1"
              >
                {angle}°
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-sm">
            {drawMode
              ? "Drawing mode on: draw on your strip."
              : "Tap a sticker or text to move, resize or tilt it. Double-click text to delete."}
          </p>
        )}
      </div>
    </div>
  );
}