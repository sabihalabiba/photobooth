'use client';
import { useState } from 'react';
import { makeSticker } from '@/lib/makeSticker';
import { useBooth } from '@/lib/store';

export default function StickerMaker({ photo }: { photo: string }) {
  const [cut, setCut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addImageSticker = useBooth((s) => s.addImageSticker);
  const addCutout = useBooth((s) => s.addCutout);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const result = await makeSticker(photo);
      setCut(result);
      addCutout(result); // sticker sheet er jonno
    } catch {
      setError('Background remove hoy ni. Internet check koro, abar try koro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="before" className="w-1/2 rounded-xl" />
        <div className="flex w-1/2 items-center justify-center rounded-xl bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
          {loading ? (
            <span className="text-sm">Making sticker... (first time is slow)</span>
          ) : cut ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cut} alt="after" />
          ) : (
            <span className="text-sm">After</span>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={run}
        disabled={loading}
        className="rounded-full bg-pink-500 px-4 py-2 text-white disabled:opacity-50"
      >
        Remove background
      </button>
      {cut && (
        <button
          onClick={() => addImageSticker(cut)}
          className="ml-2 rounded-full border px-4 py-2"
        >
          Add to strip
        </button>
      )}
    </div>
  );
}