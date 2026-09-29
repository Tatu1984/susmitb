"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const QUOTE =
  "These images are highly stylised musical scores — when one sees these paintings one also hears rhythms.";
const TAGS = ["Improvisation", "Colour", "Zen", "Tribal art", "Calligraphy", "Kind of Blue", "Mark-making", "Kolkata"];

export default function Voice() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = QUOTE.split(" ");

  return (
    <section ref={ref} className="relative overflow-hidden bg-vermilion py-32 text-ink md:py-44">
      <div className="px-4 md:px-8">
        <div className="eyebrow mb-12 flex justify-between text-ink/70">
          <span>(05) — Review</span>
          <span>“Agile and Unrestrained”</span>
        </div>
        <blockquote className="serif max-w-[22ch] text-[10vw] leading-[0.95] md:text-[5.6vw]">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w}
            </Word>
          ))}
        </blockquote>
      </div>
      <div className="mt-24 border-y border-ink/25 py-5">
        <div className="marquee serif text-[9vw] italic leading-none md:text-[5vw]" style={{ ["--dur" as string]: "36s" }}>
          {[...TAGS, ...TAGS].map((t, i) => (
            <span key={i} className="flex items-center whitespace-nowrap px-6">
              {t}
              <svg viewBox="0 0 40 40" className="ml-12 h-[0.5em] w-[0.5em]" aria-hidden>
                <path d="M20 2 C 24 16, 24 16, 38 20 C 24 24, 24 24, 20 38 C 16 24, 16 24, 2 20 C 16 16, 16 16, 20 2Z" fill="currentColor" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Word({ children, progress, range }: { children: string; progress: import("motion/react").MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const italic = /musical|rhythms|hears/.test(children);
  return (
    <motion.span style={{ opacity }} className={`inline-block pr-[0.22em] ${italic ? "italic" : ""}`}>
      {children}
    </motion.span>
  );
}
