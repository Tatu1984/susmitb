"use client";

import Image from "next/image";
import ArtImg from "@/components/ArtImg";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useCallback, useRef } from "react";
import Lightbox from "./Lightbox";
import { TileActions } from "./ArtActions";
import { type Artwork, type Medium, byId, plate } from "@/lib/art";
import { shailpik } from "@/data/content";

export default function Gallery({ medium, items, next }: { medium: Medium; items: Artwork[]; next: Medium }) {
  const router = useRouter();
  const pathname = usePathname();
  const setIndex = useCallback(
    (i: number | null) => {
      const q = i === null ? "" : `?w=${items[i].id}`;
      router.replace(`${pathname}${q}`, { scroll: false });
    },
    [items, pathname, router],
  );

  const paper = medium.tone === "paper";
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const coverScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const cover = byId(medium.cover)!;

  return (
    <div className={paper ? "bg-paper text-ink" : "bg-ink text-paper"}>
      <section ref={hero} className="relative flex h-[92svh] min-h-[560px] flex-col justify-end overflow-hidden px-4 pb-8 md:px-8">
        <motion.div className={`absolute inset-0 ${paper ? "opacity-25 mix-blend-multiply" : "opacity-45"}`} style={{ scale: coverScale }}>
          <ArtImg art={cover} size="l" fill className="object-cover" eager />
        </motion.div>
        <div className={`absolute inset-0 ${paper ? "bg-gradient-to-t from-paper via-paper/40 to-transparent" : "bg-gradient-to-t from-ink via-ink/30 to-transparent"}`} />
        <motion.div className="relative" style={{ y: titleY }}>
          <div className={`eyebrow mb-4 flex justify-between ${paper ? "text-ink/60" : "text-paper/60"}`}>
            <span>Room {medium.numeral}</span>
            <span>{items.length} works</span>
          </div>
          <h1 className="serif text-[19vw] leading-[0.8] md:text-[13vw]">
            {medium.title.split(" ").map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pr-[0.2em] align-bottom">
                <motion.span
                  className={`inline-block ${i % 2 ? "italic" : ""}`}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <p className={`mt-6 max-w-md text-lg ${paper ? "text-ink/70" : "text-paper/70"}`}>{medium.line}</p>
        </motion.div>
      </section>

      {medium.key === "light" && (
        <section className="grid gap-8 px-4 py-20 md:grid-cols-[1fr_2fr] md:px-8">
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden grayscale">
            <Image src="/people/shailpik.jpg" alt="Shailpik Biswas" fill sizes="400px" className="object-cover" />
          </div>
          <div className="self-end">
            <span className="eyebrow text-paper/50">In collaboration with</span>
            <h2 className="serif mt-3 text-6xl md:text-8xl">Shailpik <em>Biswas</em></h2>
            <p className="mt-6 max-w-xl text-paper/70">{shailpik}</p>
            <a href="https://500px.com/shailpik" target="_blank" rel="noreferrer" className="eyebrow link-u mt-6 inline-block">
              500px.com/shailpik ↗
            </a>
          </div>
        </section>
      )}

      <section className="columns-2 gap-3 px-3 py-10 md:columns-3 md:gap-6 md:px-8 md:py-16 xl:columns-4">
        {items.map((a, i) => (
          <motion.div
            key={a.id}
            role="button"
            tabIndex={0}
            onClick={() => setIndex(i)}
            onKeyDown={(e) => e.key === "Enter" && setIndex(i)}
            className="group relative mb-3 block w-full break-inside-avoid text-left md:mb-6"
            initial={{ clipPath: "inset(100% 0 0 0)", y: 60 }}
            whileInView={{ clipPath: "inset(0% 0 0 0)", y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: (i % 4) * 0.06 }}
            data-cursor="View"
          >
            <div data-art className="relative w-full overflow-hidden" style={{ aspectRatio: `${a.width}/${a.height}`, background: a.color }}>
              <ArtImg art={a} size="m" alt={`${medium.title}, plate ${plate(a)}`} fill className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.06]" />
              <TileActions id={a.id} />
            </div>
            <div className={`eyebrow mt-2 flex justify-between ${paper ? "text-ink/50" : "text-paper/50"}`}>
              <span>{plate(a)}</span>
              <span>Price on request</span>
            </div>
          </motion.div>
        ))}
      </section>

      <Link
        href={`/work/${next.key}`}
        className={`group block border-t px-4 py-20 md:px-8 md:py-28 ${paper ? "border-ink/15" : "border-paper/15"}`}
        data-cursor="Next room"
      >
        <span className={`eyebrow ${paper ? "text-ink/50" : "text-paper/50"}`}>Next room — {next.numeral}</span>
        <span className="serif mt-4 block text-[16vw] leading-[0.85] transition-all duration-700 ease-[var(--ease-out)] group-hover:translate-x-6 group-hover:italic md:text-[10vw]">
          {next.title} →
        </span>
      </Link>

      <Suspense>
        <QueryLightbox items={items} setIndex={setIndex} />
      </Suspense>
    </div>
  );
}

// Only the lightbox depends on ?w=, so the grid itself still server-renders.
function QueryLightbox({ items, setIndex }: { items: Artwork[]; setIndex: (i: number | null) => void }) {
  const w = useSearchParams().get("w");
  const index = w ? items.findIndex((a) => a.id === w) : -1;
  return <Lightbox items={items} index={index >= 0 ? index : null} onClose={() => setIndex(null)} onIndex={setIndex} />;
}
