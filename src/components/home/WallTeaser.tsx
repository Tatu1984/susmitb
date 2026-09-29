"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { artworks } from "@/lib/art";

// Deterministic shuffle so SSR and client match.
const shuffled = [...artworks].sort((a, b) => ((a.id.length * 31 + a.no * 17) % 23) - ((b.id.length * 31 + b.no * 17) % 23));
const cols = Array.from({ length: 7 }, (_, c) => shuffled.filter((_, i) => i % 7 === c).slice(0, 8));

export default function WallTeaser() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"]);
  const down = useTransform(scrollYProgress, [0, 1], ["-30%", "10%"]);
  const rotX = useTransform(scrollYProgress, [0, 0.5, 1], [35, 22, 10]);

  return (
    <section ref={ref} className="relative h-[130vh] overflow-hidden bg-ink [perspective:1400px]">
      <motion.div
        className="absolute inset-[-20%] flex justify-center gap-4"
        style={{ rotateX: rotX, rotateZ: -8, transformStyle: "preserve-3d" }}
      >
        {cols.map((col, c) => (
          <motion.div key={c} className="flex w-[22vw] shrink-0 flex-col gap-4 md:w-[13vw]" style={{ y: c % 2 ? down : up }}>
            {col.map((a) => (
              <div key={a.id} className="relative w-full" style={{ aspectRatio: `${a.width}/${a.height}` }}>
                <Image src={a.src} alt="" fill sizes="13vw" className="object-cover" />
              </div>
            ))}
          </motion.div>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,10,9,.35),rgba(11,10,9,.95)_75%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        <span className="eyebrow mb-6 text-paper/60">(07) — The Wall</span>
        <h2 className="serif text-[18vw] leading-[0.8] md:text-[11vw]">
          Every <em>mark</em>,<br /> at once
        </h2>
        <p className="mt-8 max-w-md text-paper/70">
          {artworks.length} works across five practices on one endless wall. Drag, fling, get lost.
        </p>
        <Link
          href="/wall"
          className="group mt-10 inline-flex items-center gap-4 rounded-full bg-paper px-8 py-4 text-ink transition-colors duration-500 hover:bg-accent"
          data-cursor="Enter"
        >
          <span className="eyebrow">Enter the Wall</span>
          <span className="transition-transform duration-500 group-hover:translate-x-2">→</span>
        </Link>
      </div>
    </section>
  );
}
