'use client';
import { useEffect, useRef, useState } from 'react';
import { useBooth, MAX_PHOTOS } from '@/lib/store';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);

  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  const addPhoto = useBooth((s) => s.addPhoto);
  const stripSize = useBooth((s) => s.stripSize);
  const photoCount = useBooth((s) => s.photos.length);
  const full = photoCount >= MAX_PHOTOS;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

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
    if (facing === 'user') {
      // save it mirrored, same as the preview
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0);
    addPhoto(c.toDataURL('image/jpeg', 0.92));
  }

  // 3-2-1, tarpor capture + flash
  async function shoot() {
    for (let n = 3; n >= 1; n--) {
      if (!mounted.current) return;
      setCount(n);
      await sleep(1000);
    }
    if (!mounted.current) return;
    setCount(null);
    capture();
    setFlash(true);
    setTimeout(() => mounted.current && setFlash(false), 120);
  }

  async function startOne() {
    if (busy.current || full) return;
    busy.current = true;
    try {
      await shoot();
    } finally {
      busy.current = false;
    }
  }

  async function autoStrip() {
    if (busy.current) return;
    busy.current = true;
    try {
      for (let i = 0; i < stripSize; i++) {
        if (useBooth.getState().photos.length >= MAX_PHOTOS) break;
        await shoot();
        await sleep(700);
      }
    } finally {
      busy.current = false;
    }
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => addPhoto(r.result as string);
    r.readAsDataURL(file);
    e.target.value = '';
  }

  const disabled = count !== null || full;

  return (
    <div className="flex flex-col items-center gap-3">
      {error ? (
        <p className="rounded-xl bg-pink-100 p-4 text-center text-sm">{error}</p>
      ) : (
        <div className="relative w-full max-w-md">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-2xl bg-black"
            style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
          />
          {count !== null && (
            <div className="absolute inset-0 flex items-center justify-center text-8xl font-bold text-white drop-shadow-lg">
              {count}
            </div>
          )}
        </div>
      )}

      {/* shutter flash */}
      <div
        className={`pointer-events-none fixed inset-0 z-50 bg-white transition-opacity ${
          flash ? 'opacity-100 duration-75' : 'opacity-0 duration-300'
        }`}
      />

      <div className="flex flex-wrap justify-center gap-2">
        {!error && (
          <button
            onClick={startOne}
            disabled={disabled}
            className="rounded-full bg-pink-500 px-6 py-2 text-white disabled:opacity-50"
          >
            Capture
          </button>
        )}
        {!error && (
          <button
            onClick={autoStrip}
            disabled={disabled}
            className="rounded-full bg-purple-500 px-6 py-2 text-white disabled:opacity-50"
          >
            Auto strip ({stripSize})
          </button>
        )}
        {!error && (
          <button
            onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')}
            disabled={count !== null}
            className="rounded-full border px-4 py-2 disabled:opacity-50"
          >
            Flip camera
          </button>
        )}
        <label className="cursor-pointer rounded-full border px-4 py-2">
          Upload
          <input type="file" accept="image/*" hidden onChange={onUpload} />
        </label>
      </div>

      {full && (
        <p className="text-sm">
          {MAX_PHOTOS} ta photo hoye geche. Ekta delete koro, ba strip er jonno photo select koro.
        </p>
      )}
    </div>
  );
}