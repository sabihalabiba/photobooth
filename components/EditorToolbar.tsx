"use client";

import { useState } from "react";
import { Smile, Type, Palette } from "lucide-react";
import { STARTER_STICKERS } from "@/lib/stickers";

const FILTERS = ["None", "B&W", "Vintage", "Warm", "Cool"];
const TABS = [
  { id: "stickers", label: "Stickers", icon: Smile },
  { id: "text", label: "Text", icon: Type },
  { id: "filters", label: "Filters", icon: Palette },
] as const;

type Props = {
  onAddSticker?: (stickerId: string) => void;
  onAddText?: (text: string) => void;
  onFilter?: (filter: string) => void;
};

export default function EditorToolbar({
  onAddSticker,
  onAddText,
  onFilter,
}: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("stickers");
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("None");

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 font-heading text-sm ${
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
      </div>
    </div>
  );
}