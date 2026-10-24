'use client';
import { useEffect, useRef, useState } from 'react';
import { MAX_PHOTOS, useBooth } from '@/lib/store';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const stopRef = useRef(false);

  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [auto, setAuto] = useState(false);

  const addPhoto = useBooth((s) => s.addPhoto);
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

    // small delay so the dev server's double-run never starts the camera twice (iPhone bug)
    const timer = setTimeout(async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('This browser cannot use the camera here. Open the site in Safari or Chrome over HTTPS, or upload a photo instead.');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setError(null);
        const v = videoRef.current;
        if (v) {
          v.muted = true; // iPhones only autoplay muted video
          v.setAttribute('playsinline', 'true');
          v.srcObject = stream;
          try {
            await v.play();
          } catch {
            /* Safari may need a tap, which is fine */
          }
        }
      } catch (err) {
        const name = err instanceof Error ? err.name : 'Error';
        setError(
          `Camera problem (${name}). Please allow camera permission, or upload a photo instead.`
        );
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth || full) return;
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

  // 3-2-1, then capture + flash
  async function shoot() {
    for (let n = 3; n >= 1; n--) {
      if (!mounted.current || stopRef.current) {
        setCount(null);
        return;
      }
      setCount(n);
      await sleep(1000);
    }
    if (!mounted.current || stopRef.current) {
      setCount(null);
      return;
    }
    setCount(null);
    capture();
    setFlash(true);
    setTimeout(() => mounted.current && setFlash(false), 120);
  }

  async function startOne() {
    if (busy.current || full) return;
    busy.current = true;
    stopRef.current = false;
    try {
      await shoot();
    } finally {
      busy.current = false;
    }
  }

  // keeps shooting until the tray has MAX_PHOTOS photos (or you press Stop)
  async function autoStrip() {
    if (busy.current) return;
    busy.current = true;
    stopRef.current = false;
    setAuto(true);
    try {
      while (
        useBooth.getState().photos.length < MAX_PHOTOS &&
        !stopRef.current &&
        mounted.current
      ) {
        await shoot();
        await sleep(700);
      }
    } finally {
      busy.current = false;
      if (mounted.current) setAuto(false);
    }
  }

  function stopAuto() {
    stopRef.current = true;
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || full) return;
    const r = new FileReader();
    r.onload = () => addPhoto(r.result as string);
    r.readAsDataURL(file);
    e.target.value = '';
  }

  const disabled = count !== null || full || auto;

  return (
    <div className="flex flex-col items-center gap-4">
      {error ? (
        <p className="rounded-xl bg-blush p-4 text-center text-sm">{error}</p>
      ) : (
        <div className="relative w-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})}
            className="aspect-[4/3] w-full rounded-2xl bg-black object-cover"
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

      <div className="flex flex-wrap items-center justify-center gap-2">
        {!error && (
          <button
            onClick={startOne}
            disabled={disabled}
            className="rounded-full bg-berry px-6 py-2 font-heading text-white shadow-lg transition hover:scale-105 disabled:opacity-40"
          >
            Capture
          </button>
        )}
        {!error && !auto && (
          <button
            onClick={autoStrip}
            disabled={disabled}
            className="rounded-full bg-sky px-6 py-2 font-heading disabled:opacity-40"
          >
            Auto strip ({MAX_PHOTOS - photoCount})
          </button>
        )}
        {!error && auto && (
          <button
            onClick={stopAuto}
            className="rounded-full bg-ink px-6 py-2 font-heading text-white"
          >
            Stop
          </button>
        )}
        {!error && (
          <button
            onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')}
            disabled={count !== null || auto}
            className="rounded-full bg-blush px-4 py-2 font-heading text-sm disabled:opacity-40"
          >
            Flip camera
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
          {photoCount}/{MAX_PHOTOS}
        </span>
      </div>

      {full && (
        <p className="text-sm">
          You have {MAX_PHOTOS} photos. Delete one, or pick photos for your strip.
        </p>
      )}
    </div>
  );
}