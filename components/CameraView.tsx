'use client';
import { useEffect, useRef, useState } from 'react';
import { MAX_PHOTOS, useBooth } from '@/lib/store';

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const addPhoto = useBooth((s) => s.addPhoto);
  const count = useBooth((s) => s.photos.length);
  const full = count >= MAX_PHOTOS;

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
    if (!v || !v.videoWidth || full) return;
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
    if (!file || full) return;
    const r = new FileReader();
    r.onload = () => addPhoto(r.result as string);
    r.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {error ? (
        <p className="rounded-xl bg-blush p-4 text-center text-sm">{error}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-[4/3] w-full rounded-2xl bg-black object-cover"
          style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
        />
      )}
      <div className="flex items-center gap-3">
        {!error && (
          <button
            onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')}
            className="rounded-full bg-blush px-4 py-2 font-heading text-sm"
          >
            Flip camera
          </button>
        )}
        {!error && (
          <button
            onClick={capture}
            disabled={full}
            className="rounded-full bg-berry px-8 py-3 font-heading text-white shadow-lg transition hover:scale-105 disabled:opacity-40"
          >
            Capture
          </button>
        )}
        <label
          className={`rounded-full bg-blush px-4 py-2 font-heading text-sm ${
            full ? 'opacity-40' : 'cursor-pointer'
          }`}
        >
          Upload
          <input type="file" accept="image/*" hidden disabled={full} onChange={onUpload} />
        </label>
        <span className="w-12 font-heading text-lg">
          {count}/{MAX_PHOTOS}
        </span>
      </div>
    </div>
  );
}