"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import PaintField from "@/components/PaintField";
import { byId, heroIds, plate } from "@/lib/art";

const slides = heroIds.map((id) => byId(id)!);

function Preloader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1600);
      const target = ready ? 100 : Math.min(92, Math.round(p * 92));
      setN((v) => (v < target ? v + Math.max(1, Math.round((target - v) * 0.12)) : v));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);
  useEffect(() => {
    if (n >= 100) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
  }, [n, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex flex-col justify-between bg-ink p-4 text-paper md:p-8"
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      initial={{ clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="eyebrow flex justify-between text-paper/60">
        <span>Preparing the canvas</span>
        <span>No AI — only intuition</span>
      </div>
      <svg viewBox="0 0 600 200" className="mx-auto w-[min(80vw,720px)] text-vermilion" aria-hidden>
        <motion.path
          d="M20 140 C 80 20, 140 190, 200 90 S 300 10, 330 120 S 420 180, 460 60 S 560 40, 580 150 M120 60 C 180 160, 260 40, 300 170 M380 30 C 400 120, 520 110, 540 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: n / 100 }}
          transition={{ ease: "linear", duration: 0.2 }}
        />
      </svg>
      <div className="flex items-end justify-between">
        <span className="serif text-[22vw] leading-[0.8] md:text-[14vw]">{String(n).padStart(3, "0")}</span>
        <span className="eyebrow pb-4 text-right text-paper/60">
          Susmit Biswas
          <br />
          Kolkata
        </span>
      </div>
    </motion.div>
  );
}

// Dark grounds make a useless accent (cursor label, selection), so fall back to vermilion.
const lum = (c: string) => [1, 3, 5].reduce((a, i, k) => a + parseInt(c.slice(i, i + 2), 16) * [0.299, 0.587, 0.114][k], 0) / 255;
const accentFor = (c: string) => (lum(c) > 0.35 ? c : "#ff3d1f");

let introPlayed = false;

const words = ["A", "game", "of", "order", "and", "chaos"];

export default function Hero() {
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(!introPlayed);
  const [idx, setIdx] = useState(0);
  const advance = useRef<(() => void) | null>(null);
  const art = slides[idx];

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentFor(art.color));
  }, [art.color]);
  useEffect(() => () => { document.documentElement.style.removeProperty("--accent"); }, []);

  return (
    <section
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink"
      onClick={() => advance.current?.()}
      data-cursor="Next"
    >
      <PaintField slides={slides} onReady={() => setReady(true)} onIndex={setIdx} advanceRef={advance} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-ink/90 via-ink/45 to-transparent" />
      <div className="hero-legible pointer-events-none absolute inset-0 flex flex-col justify-end px-4 pb-6 md:px-8 md:pb-8">
        <h1 className="serif text-paper text-[17vw] leading-[0.82] md:text-[12.5vw]">
          {words.map((w, i) => (
            <span key={w} className="inline-block overflow-hidden pr-[0.18em] align-bottom">
              <motion.span
                className={`inline-block ${w === "order" || w === "chaos" ? "italic" : ""}`}
                initial={{ y: "110%" }}
                animate={intro ? { y: "110%" } : { y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="mt-6 grid grid-cols-2 items-end gap-4 border-t border-paper/40 pt-4 text-paper md:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: intro ? 0 : 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <p className="eyebrow col-span-2 max-w-md leading-relaxed text-paper md:col-span-1">
            Paintings, digital images, drawings and light — made by hand, by improvisation, in Kolkata.
          </p>
          <div className="eyebrow hidden text-paper md:block">
            <span className="text-paper/65">Now showing</span>
            <br />
            <AnimatePresence mode="wait">
              <motion.span key={art.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="inline-flex items-center gap-2">
                <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: art.color }} />
                Paintings — Plate {plate(art)}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="eyebrow hidden text-paper md:block">
            <span className="text-paper/65">Interact</span>
            <br />
            Move to smear · Click for next
          </div>
          <div className="eyebrow flex items-center justify-end gap-3 text-paper">
            <span>{String(idx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
            <span className="relative h-10 w-px overflow-hidden bg-paper/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_var(--ease-io)_infinite] bg-paper" />
            </span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>{intro && <Preloader ready={ready} onDone={() => { introPlayed = true; setIntro(false); }} />}</AnimatePresence>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
