import Link from "next/link";
import { Camera, Images, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Take photos",
    text: "Snap up to 8 pictures with your camera.",
  },
  {
    icon: Images,
    title: "Pick your favorites",
    text: "Choose 3 or 4 for your photobooth strip.",
  },
  {
    icon: Sparkles,
    title: "Decorate",
    text: "Add doodles, stickers and text, then download.",
  },
];

function StripExample({ color, tilt }: { color: string; tilt: string }) {
  return (
    <div
      className={`${color} ${tilt} flex w-28 flex-col gap-2 rounded-lg p-2 shadow-lg`}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="aspect-[4/3] rounded bg-white/70" />
      ))}
      <p className="text-center font-heading text-xs text-ink">photobooth</p>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center">
        <h1 className="font-heading text-5xl text-berry sm:text-6xl">
          Photobooth Studio
        </h1>
        <p className="mt-4 max-w-md text-lg">
          Take photos, build a strip, and decorate it with cute stickers. No
          editing skills needed.
        </p>
        <Link
          href="/camera"
          className="mt-8 rounded-full bg-berry px-8 py-3 font-heading text-lg text-white shadow-md transition hover:scale-105"
        >
          Start
        </Link>
      </section>

      {/* Examples */}
      <section className="flex flex-wrap items-center justify-center gap-6 px-6 pb-16">
        <StripExample color="bg-blush" tilt="-rotate-6" />
        <StripExample color="bg-sky" tilt="rotate-3" />
        <StripExample color="bg-white" tilt="-rotate-2" />
      </section>

      {/* How it works */}
      <section className="bg-blush/40 px-6 py-16">
        <h2 className="text-center font-heading text-3xl text-ink">
          How it works
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="rounded-2xl bg-cream p-6 text-center shadow"
            >
              <Icon className="mx-auto h-8 w-8 text-berry" />
              <h3 className="mt-3 font-heading text-xl">
                {i + 1}. {title}
              </h3>
              <p className="mt-2 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm">
        Made with love by Labiba &amp; Toshrif
      </footer>
    </main>
  );
}