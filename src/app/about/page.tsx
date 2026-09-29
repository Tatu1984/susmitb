import Image from "next/image";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { artist, bio, groupShows, review, soloShows, words, type Show } from "@/data/content";
import { byId } from "@/lib/art";

export const metadata: Metadata = { title: "About" };

// Sentences in the essay worth pulling out of the body copy.
const PULL = ["And then rolls the dice.", "But after all that, you do need to jump.", "What you see is what you get.", "Letting go means allowing something else to take over."];

function Ledger({ title, shows }: { title: string; shows: Show[] }) {
  return (
    <div>
      <h3 className="eyebrow mb-6 text-ink/50">{title}</h3>
      <ul>
        {shows.map((s, i) => (
          <li key={i} className="grid grid-cols-[3.5rem_1fr] gap-3 border-t border-ink/15 py-3.5 text-sm md:grid-cols-[4rem_1fr_1fr]">
            <span className="mono text-ink/50">{s.year}</span>
            <span className="serif text-xl leading-tight md:text-2xl">{s.title}</span>
            <span className="col-start-2 text-ink/60 md:col-start-auto">{s.venue}, {s.city} · {s.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Para({ text, i }: { text: string; i: number }) {
  const pull = PULL.find((p) => text.includes(p));
  if (!pull)
    return <p className={i === 0 ? "first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-[5.2em] first-letter:leading-[0.8] first-letter:text-vermilion" : ""}>{text}</p>;
  const [a, b] = text.split(pull);
  return (
    <p>
      {a}
      <span className="serif text-[1.5em] italic leading-tight text-vermilion">{pull}</span>
      {b}
    </p>
  );
}

export default function About() {
  const tall = byId("paintings-p19-26")!;
  const fig = byId("paintings-p26-23")!;
  return (
    <main className="bg-paper text-ink">
      {/* bio */}
      <section id="bio" className="grid gap-12 px-4 pb-24 pt-32 md:grid-cols-[1.1fr_1fr] md:px-8 md:pt-44">
        <div>
          <span className="eyebrow text-ink/50">About me</span>
          <h1 className="serif mt-6 text-[16vw] leading-[0.82] md:text-[8.5vw]">
            A game of <em>order</em> &amp; <em className="text-vermilion">chaos</em>
          </h1>
          <div className="mt-12 max-w-xl space-y-6 text-lg leading-relaxed text-ink/80">
            {bio.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}><p>{p}</p></Reveal>
            ))}
          </div>
          <p className="eyebrow mt-10 text-ink/50">Collectors in {artist.collectors.join(" · ")}</p>
        </div>
        <Reveal className="relative md:sticky md:top-24 md:self-start">
          <div className="relative w-full" style={{ aspectRatio: `${tall.width}/${tall.height}` }}>
            <Image src={tall.src} alt="Painting by Susmit Biswas" fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" priority />
          </div>
          <span className="eyebrow mt-3 block text-ink/50">Paintings — detail</span>
        </Reveal>
      </section>

      {/* cv */}
      <section className="grid gap-16 border-t border-ink/15 px-4 py-24 md:grid-cols-2 md:px-8">
        <Ledger title="Solo exhibitions" shows={soloShows} />
        <Ledger title="Group exhibitions" shows={groupShows} />
      </section>

      {/* words */}
      <section id="words" className="bg-ink px-4 py-28 text-paper md:px-8 md:py-40">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div className="md:sticky md:top-28 md:self-start">
            <span className="eyebrow text-paper/50">Words — by the artist</span>
            <h2 className="serif mt-6 text-[14vw] leading-[0.85] md:text-[6vw]">
              If you look, you may <em>not leap</em>
            </h2>
            <div className="relative mt-10 hidden aspect-[4/5] w-2/3 md:block">
              <Image src={fig.src} alt="" fill sizes="30vw" className="object-cover" />
            </div>
          </div>
          <div className="space-y-7 text-lg leading-[1.75] text-paper/80 md:text-xl">
            {words.paragraphs.map((p, i) => (
              <Reveal key={i}><Para text={p} i={i} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* review */}
      <section id="review" className="px-4 py-28 md:px-8 md:py-40">
        <span className="eyebrow text-ink/50">Review</span>
        <h2 className="serif mt-6 text-[16vw] leading-[0.82] md:text-[9vw]">
          Agile <em>&amp;</em> unrestrained
        </h2>
        <div className="mt-16 gap-10 text-lg leading-relaxed text-ink/80 md:columns-2">
          {review.paragraphs.map((p, i) => (
            <p key={i} className="mb-6 break-inside-avoid">{p}</p>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
