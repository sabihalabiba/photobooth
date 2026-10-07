'use client';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store'; // adjust to match Labiba's store export

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const addPhoto = useStore((s: any) => s.addPhoto);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        setError(null);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError('Camera access denied or not available. Please allow camera permission, or upload a photo instead.');
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d')!;
    if (facing === 'user') { // save it mirrored, same as the preview
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0);
    addPhoto(c.toDataURL('image/jpeg', 0.92));
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => addPhoto(r.result as string);
    r.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {error ? (
        <p className="rounded-xl bg-pink-100 p-4 text-center text-sm">{error}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md rounded-2xl bg-black"
          style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
        />
      )}
      <div className="flex gap-2">
        {!error && <button onClick={capture} className="rounded-full bg-pink-500 px-6 py-2 text-white">Capture</button>}
        {!error && <button onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')} className="rounded-full border px-4 py-2">Flip camera</button>}
        <label className="cursor-pointer rounded-full border px-4 py-2">
          Upload
          <input type="file" accept="image/*" hidden onChange={onUpload} />
        </label>
      </div>
    </div>
  );
}