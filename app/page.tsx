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

const examples = [
  { src: "/examples/cutee.png", name: "Cute", tilt: "-rotate-6" },
  { src: "/examples/vintage.png", name: "Vintage", tilt: "rotate-3" },
  { src: "/examples/y2k.png", name: "Y2K", tilt: "-rotate-2" },
  { src: "/examples/retro.png", name: "Retro Film", tilt: "rotate-6" },
  { src: "/examples/scrapbook.png", name: "Scrapbook", tilt: "-rotate-3" },
];

function Example({
  src,
  name,
  tilt,
}: {
  src: string;
  name: string;
  tilt: string;
}) {
  return (
    <figure
      className={`${tilt} w-32 shrink-0 transition hover:z-10 hover:rotate-0 hover:scale-110 sm:w-40`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} photo strip`}
        className="w-full rounded-lg shadow-xl"
      />
      <figcaption className="mt-2 text-center font-heading text-sm">
        {name}
      </figcaption>
    </figure>
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
      <section className="flex flex-wrap items-start justify-center gap-6 px-6 pb-16">
        {examples.map((e) => (
          <Example key={e.name} {...e} />
        ))}
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
      <footer className="px-6 py-8 text-center font-heading text-lg text-berry">
        Snap it. Stick it. Keep it.
      </footer>
    </main>
  );
}