"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBooth } from "@/lib/store";
import { renderSheet } from "@/lib/renderSheet";

export default function SheetPage() {
  const cutouts = useBooth((s) => s.cutouts);
  const [cutLines, setCutLines] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!cutouts.length) {
      setPreview(null);
      return;
    }
    let alive = true;
    renderSheet(cutouts, cutLines).then((c) => {
      if (alive) setPreview(c.toDataURL("image/png"));
    });
    return () => {
      alive = false;
    };
  }, [cutouts, cutLines]);

  async function downloadPng() {
    const c = await renderSheet(cutouts, cutLines);
    c.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob!);
      a.download = "sticker-sheet.png";
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  }

  async function downloadPdf() {
    const c = await renderSheet(cutouts, cutLines);
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
    pdf.save("sticker-sheet.pdf");
  }

  if (!cutouts.length) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="font-heading text-xl">
          Make a cutout sticker first (use "Remove background" in the editor).
        </p>
        <Link
          href="/editor"
          className="mt-6 inline-block rounded-full bg-berry px-8 py-3 font-heading text-white"
        >
          Back to editor
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-center font-heading text-3xl text-berry">Sticker sheet</h1>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={cutLines}
            onChange={(e) => setCutLines(e.target.checked)}
          />
          Cut lines
        </label>
        <button onClick={downloadPng} className="rounded-full bg-berry px-6 py-2 font-heading text-white">
          Download PNG
        </button>
        <button onClick={downloadPdf} className="rounded-full bg-berry px-6 py-2 font-heading text-white">
          Download PDF
        </button>
        <Link href="/editor" className="rounded-full bg-blush px-6 py-2 font-heading">
          Back
        </Link>
      </div>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="A4 preview" className="mx-auto mt-6 w-full max-w-md rounded shadow-lg" />
      )}
    </main>
  );
}