"use client";

import ArtImg from "@/components/ArtImg";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCart, type Edition } from "@/lib/cart";
import { type Artwork, mediumOf, plate } from "@/lib/art";
import { getLenis } from "./SmoothScroll";

export default function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: Artwork[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index !== null;
  const a = open ? items[index] : null;
  const strip = useRef<HTMLDivElement>(null);
  const [edition, setEdition] = useState<Edition>("original");
  const cart = useCart();
  const inSet = a ? cart.has(a.id) : false;

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index! + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index! - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      getLenis()?.start();
      document.body.style.overflow = "";
    };
  }, [open, index, items.length, onClose, onIndex]);

  useEffect(() => {
    strip.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [index]);

  return (
    <AnimatePresence>
      {a && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[85] flex flex-col text-paper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="absolute inset-0" animate={{ backgroundColor: a.color }} transition={{ duration: 0.8 }} />
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-2xl" />

          <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
            {/* meta */}
            <aside className="order-2 flex shrink-0 flex-col justify-between gap-6 px-4 pb-4 md:order-1 md:w-[340px] md:px-8 md:pb-8 md:pt-28">
              <div>
                <span className="eyebrow text-paper/50">{mediumOf(a.medium).title}</span>
                <h3 className="serif mt-2 text-5xl leading-none md:text-7xl">
                  Plate <em>{plate(a)}</em>
                </h3>
                <dl className="eyebrow mt-8 hidden grid-cols-2 gap-y-3 text-paper/70 md:grid">
                  <dt className="text-paper/40">Artist</dt><dd>Susmit Biswas</dd>
                  <dt className="text-paper/40">Practice</dt><dd>{mediumOf(a.medium).title}</dd>
                  <dt className="text-paper/40">Ground</dt>
                  <dd className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full ring-1 ring-paper/30" style={{ background: a.color }} />{a.color}</dd>
                  <dt className="text-paper/40">Index</dt><dd>{index! + 1} of {items.length}</dd>
                </dl>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border border-paper/15 bg-ink/30 p-4">
                  <span className="eyebrow text-paper/50">Edition</span>
                  <div className="mt-3 grid grid-cols-2 gap-1 rounded-full border border-paper/15 p-1">
                    {(["original", "print"] as Edition[]).map((ed) => (
                      <button
                        key={ed}
                        onClick={() => setEdition(ed)}
                        className={`eyebrow rounded-full py-2 text-[10px] transition-colors ${edition === ed ? "bg-paper text-ink" : "text-paper/60 hover:text-paper"}`}
                      >
                        {ed === "original" ? "Original" : "Fine-art print"}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="eyebrow text-paper/50">{edition === "original" ? "One of one" : "Edition details soon"}</span>
                    <span className="serif text-2xl">Price on request</span>
                  </div>
                </div>
                <button
                  onClick={() => cart.add(a.id, edition)}
                  className="eyebrow rounded-full bg-paper px-5 py-4 text-center text-ink transition-colors hover:bg-accent"
                  data-cursor="Buy"
                >
                  Buy now →
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => (inSet ? cart.remove(a.id) : cart.add(a.id, edition, false))}
                    className={`eyebrow rounded-full border px-4 py-3 text-center text-[10px] transition-colors ${inSet ? "border-accent bg-accent text-ink" : "border-paper/30 hover:border-paper"}`}
                  >
                    {inSet ? "In your set ✓" : "+ Add to set"}
                  </button>
                  <Link
                    href={`/contact?work=${a.id}`}
                    className="eyebrow rounded-full border border-paper/30 px-4 py-3 text-center text-[10px] transition-colors hover:border-paper"
                    data-cursor="Write"
                  >
                    Enquire
                  </Link>
                </div>
              </div>
            </aside>

            {/* image */}
            <div className="relative order-1 min-h-0 flex-1 md:order-2">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={a.id}
                  data-art
                  className="absolute inset-4 top-20 md:inset-10 md:top-24"
                  initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) onIndex((index! + 1) % items.length);
                    else if (info.offset.x > 80) onIndex((index! - 1 + items.length) % items.length);
                  }}
                >
                  <ArtImg art={a} size="l" alt={`${mediumOf(a.medium).title}, plate ${plate(a)}`} fill className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,.5)]" eager />
                </motion.div>
              </AnimatePresence>
              <button onClick={() => onIndex((index! - 1 + items.length) % items.length)} className="absolute inset-y-0 left-0 w-1/4" data-cursor="Prev" aria-label="Previous" />
              <button onClick={() => onIndex((index! + 1) % items.length)} className="absolute inset-y-0 right-0 w-1/4" data-cursor="Next" aria-label="Next" />
            </div>
          </div>

          <div ref={strip} data-art className="relative flex h-20 shrink-0 gap-2 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:px-8">
            {items.map((it, i) => (
              <button
                key={it.id}
                data-i={i}
                onClick={() => onIndex(i)}
                className={`relative h-full shrink-0 overflow-hidden transition-all duration-500 ${i === index ? "opacity-100 ring-1 ring-paper" : "opacity-35 hover:opacity-80"}`}
                style={{ aspectRatio: `${it.width}/${it.height}` }}
              >
                <ArtImg art={it} size="s" fill className="object-cover" />
              </button>
            ))}
          </div>

          <button onClick={onClose} className="eyebrow absolute right-4 top-5 z-10 flex items-center gap-3 md:right-8 md:top-7" data-cursor="Close">
            Close <span className="text-lg leading-none">✕</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
