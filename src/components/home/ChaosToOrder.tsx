"use client";

import ArtImg from "@/components/ArtImg";
import { useMotionValueEvent, useScroll, useTransform, motion } from "motion/react";
import { useRef } from "react";
import { byId } from "@/lib/art";

const LINE =
  "He draws from the abandon of improvisation in music, the sensual charge of colour, and the dialogue between stillness and movement.";
const EMPH = new Set(["improvisation", "colour,", "stillness", "movement."]);

// Deterministic scatter so server and client agree.
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const floaters = [
  { id: "paintings-p26-06", x: "6%", y: "12%", w: 180, s: 0.6 },
  { id: "brush-ink-bi-11", x: "78%", y: "8%", w: 150, s: 1.1 },
  { id: "paintings-p19-23", x: "84%", y: "62%", w: 200, s: 0.8 },
  { id: "digital-g-15", x: "4%", y: "70%", w: 220, s: 1.3 },
  { id: "drawings-d-12", x: "46%", y: "84%", w: 130, s: 0.5 },
];

export default function ChaosToOrder() {
  const ref = useRef<HTMLElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const order = useTransform(scrollYProgress, [0.05, 0.7], [0, 1], { clamp: true });

  useMotionValueEvent(order, "change", (v) => {
    // ease-out so letters snap together near the end, like a decision
    const e = 1 - Math.pow(1 - v, 3);
    text.current?.style.setProperty("--p", e.toFixed(4));
  });

  let li = 0;
  return (
    <section ref={ref} className="relative h-[320vh] bg-paper text-ink">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden px-4 md:px-8">
        {floaters.map((f, i) => {
          const a = byId(f.id)!;
          return (
            <Floater key={f.id} progress={scrollYProgress} speed={f.s} style={{ left: f.x, top: f.y, width: f.w }} i={i}>
              <ArtImg art={a} size="s" className="h-auto w-full shadow-[0_30px_60px_-20px_rgba(0,0,0,.35)]" eager />
            </Floater>
          );
        })}

        <div className="eyebrow relative mb-10 flex justify-between text-ink/60">
          <span>(01) — Statement</span>
          <motion.span style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [1, 0]) }}>Chaos</motion.span>
          <motion.span style={{ opacity: useTransform(scrollYProgress, [0.5, 0.75], [0, 1]) }}>→ Order</motion.span>
        </div>

        <p
          ref={text}
          className="serif relative max-w-[16ch] text-[12vw] leading-[0.92] md:max-w-[20ch] md:text-[6.4vw]"
          style={{ ["--p" as string]: 0 }}
          aria-label={LINE}
        >
          {LINE.split(" ").map((w, wi) => (
            <span key={wi} className={`inline-block whitespace-nowrap pr-[0.24em] ${EMPH.has(w) ? "italic text-[color:var(--vermilion)]" : ""}`} aria-hidden>
              {w.split("").map((ch) => {
                const i = li++;
                const dx = (rand(i, 1) - 0.5) * 120;
                const dy = (rand(i, 2) - 0.5) * 90;
                const r = (rand(i, 3) - 0.5) * 540;
                const sc = 0.4 + rand(i, 4) * 2.2;
                return (
                  <span
                    key={i}
                    className="inline-block will-change-transform"
                    style={{
                      transform: `translate(calc(${dx}vw * (1 - var(--p))), calc(${dy}vh * (1 - var(--p)))) rotate(calc(${r}deg * (1 - var(--p)))) scale(calc(1 + ${sc - 1} * (1 - var(--p))))`,
                      opacity: `calc(0.25 + 0.75 * var(--p))`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        </p>

        <motion.p
          className="eyebrow relative mt-12 max-w-sm text-ink/60"
          style={{ opacity: useTransform(scrollYProgress, [0.7, 0.85], [0, 1]) }}
        >
          “If you look, you may not leap.” — Solo exhibition, Akar Prakar, 2008
        </motion.p>
      </div>
    </section>
  );
}

function Floater({
  progress,
  speed,
  style,
  children,
  i,
}: {
  progress: import("motion/react").MotionValue<number>;
  speed: number;
  style: React.CSSProperties;
  children: React.ReactNode;
  i: number;
}) {
  const y = useTransform(progress, [0, 1], [200 * speed, -400 * speed]);
  const rotate = useTransform(progress, [0, 1], [(i % 2 ? -1 : 1) * 14, (i % 2 ? 1 : -1) * 4]);
  return (
    <motion.div className="pointer-events-none absolute opacity-90" style={{ ...style, y, rotate }}>
      {children}
    </motion.div>
  );
}
