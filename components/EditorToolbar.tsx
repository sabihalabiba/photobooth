"use client";

import { useEffect, useState } from "react";
import {
  Smile,
  Type,
  Palette,
  Sparkles,
  Pencil,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react";
import { STARTER_STICKERS } from "@/lib/stickers";
import { THEME_LIST } from "@/lib/themes";
import { useBooth } from "@/lib/store";

const FILTERS = ["None", "B&W", "Vintage", "Warm", "Cool"];
const TABS = [
  { id: "stickers", label: "Stickers", icon: Smile },
  { id: "text", label: "Text", icon: Type },
  { id: "filters", label: "Filters", icon: Palette },
  { id: "themes", label: "Themes", icon: Sparkles },
  { id: "draw", label: "Draw", icon: Pencil },
] as const;

type Props = {
  onAddSticker?: (stickerId: string) => void;
  onAddText?: (text: string) => void;
  onFilter?: (filter: string) => void;
};

export default function EditorToolbar({ onAddSticker, onAddText, onFilter }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("stickers");
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("None");

  const {
    theme,
    setTheme,
    setDrawMode,
    brushColor,
    brushSize,
    setBrushColor,
    setBrushSize,
    undo,
    redo,
    clearStrokes,
    strokes,
    redoStrokes,
  } = useBooth();

  useEffect(() => {
    setDrawMode(tab === "draw");
    return () => setDrawMode(false);
  }, [tab, setDrawMode]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex min-w-[90px] flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 font-heading text-sm ${
              tab === id ? "bg-berry text-white" : "bg-blush text-ink"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "stickers" && (
          <div className="grid grid-cols-3 gap-3">
            {STARTER_STICKERS.map((s) => (
              <button
                key={s.id}
                onClick={() => onAddSticker?.(s.id)}
                aria-label={s.label}
                className="rounded-xl bg-cream p-3 text-3xl transition hover:scale-110"
              >
                {s.emoji}
              </button>
            ))}
          </div>
        )}

        {tab === "text" && (
          <div className="flex flex-col gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something cute..."
              className="rounded-xl border-2 border-blush bg-cream px-3 py-2 outline-none focus:border-berry"
            />
            <button
              onClick={() => {
                if (text.trim()) {
                  onAddText?.(text);
                  setText("");
                }
              }}
              className="rounded-full bg-berry px-4 py-2 font-heading text-white"
            >
              Add text
            </button>
          </div>
        )}

        {tab === "filters" && (
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  onFilter?.(f);
                }}
                className={`rounded-full px-4 py-2 text-sm ${
                  filter === f ? "bg-berry text-white" : "bg-sky text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {tab === "themes" && (
          <div className="grid grid-cols-2 gap-3">
            {THEME_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-2 rounded-xl border-2 p-2 text-sm ${
                  theme === t.id ? "border-berry" : "border-transparent bg-cream"
                }`}
              >
                <span
                  className="h-6 w-6 shrink-0 rounded"
                  style={{
                    background: `linear-gradient(${t.bg[0]}, ${t.bg[1]})`,
                    border: `2px solid ${t.photoBorder}`,
                  }}
                />
                {t.name}
              </button>
            ))}
          </div>
        )}

        {tab === "draw" && (
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between text-sm">
              Color
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              Size
              <input
                type="range"
                min={1}
                max={12}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="flex-1"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!strokes.length}
                className="flex flex-1 items-center justify-center gap-1 rounded-full bg-blush px-3 py-2 text-sm disabled:opacity-40"
              >
                <Undo2 className="h-4 w-4" /> Undo
              </button>
              <button
                onClick={redo}
                disabled={!redoStrokes.length}
                className="flex flex-1 items-center justify-center gap-1 rounded-full bg-blush px-3 py-2 text-sm disabled:opacity-40"
              >
                <Redo2 className="h-4 w-4" /> Redo
              </button>
              <button
                onClick={clearStrokes}
                disabled={!strokes.length}
                className="rounded-full bg-blush p-2 text-berry disabled:opacity-40"
                aria-label="Clear drawing"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}