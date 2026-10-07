'use client';
import { useState } from 'react';
import { makeSticker } from '@/lib/makeSticker';
import { useStore } from '@/lib/store';

export default function StickerMaker({ photo }: { photo: string }) {
  const [cut, setCut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const addSticker = useStore((s: any) => s.addSticker); // use Labiba's real function name

  async function run() {
    setLoading(true);
    try { setCut(await makeSticker(photo)); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <img src={photo} alt="before" className="w-1/2 rounded-xl" />
        <div className="flex w-1/2 items-center justify-center rounded-xl bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
          {loading ? <span className="text-sm">Making sticker... (first time is slow)</span>
            : cut ? <img src={cut} alt="after" /> : <span className="text-sm">After</span>}
        </div>
      </div>
      <button onClick={run} disabled={loading} className="rounded-full bg-pink-500 px-4 py-2 text-white">Remove background</button>
      {cut && <button onClick={() => addSticker(cut)} className="ml-2 rounded-full border px-4 py-2">Add to strip</button>}
    </div>
  );
}