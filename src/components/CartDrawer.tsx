"use client";

import ArtImg from "@/components/ArtImg";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { byId, mediumOf, plate } from "@/lib/art";
import { useCart, type Edition } from "@/lib/cart";
import { getLenis } from "./SmoothScroll";

const EDITION: Record<Edition, string> = { original: "Original", print: "Fine-art print" };

export default function CartDrawer() {
  const { items, open, setOpen, remove, add, clear } = useCart();

  useEffect(() => {
    if (open) getLenis()?.stop();
    else getLenis()?.start();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, setOpen]);

  const works = items.map((it) => ({ ...it, art: byId(it.id)! })).filter((x) => x.art);
  const enquireHref = `/contact?works=${works.map((w) => `${w.id}:${w.edition}`).join(",")}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[88] bg-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            data-lenis-prevent
            className="fixed inset-y-0 right-0 z-[89] flex w-full max-w-md flex-col bg-paper text-ink"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <header className="flex items-start justify-between border-b border-ink/10 p-6">
              <div>
                <span className="eyebrow text-ink/50">Your set</span>
                <h2 className="serif mt-1 text-5xl leading-none">
                  {works.length} <em>{works.length === 1 ? "work" : "works"}</em>
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="eyebrow pt-1" data-cursor="Close">Close ✕</button>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              {works.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="serif text-3xl">Nothing collected <em>yet</em></p>
                  <p className="mt-3 max-w-xs text-sm text-ink/60">
                    Choose single works, or build a set of pieces that belong together.
                  </p>
                  <Link href="/wall" onClick={() => setOpen(false)} className="eyebrow mt-8 rounded-full bg-ink px-6 py-3 text-paper">
                    Browse the Wall →
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  <AnimatePresence initial={false}>
                    {works.map(({ id, edition, art }) => (
                      <motion.li
                        key={id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-4"
                      >
                        <div data-art className="relative h-24 w-20 shrink-0 overflow-hidden" style={{ background: art.color }}>
                          <ArtImg art={art} size="s" fill className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="serif text-2xl leading-none">Plate {plate(art)}</p>
                            <p className="eyebrow mt-1 text-ink/50">{mediumOf(art.medium).title}</p>
                          </div>
                          <div className="flex gap-1">
                            {(["original", "print"] as Edition[]).map((ed) => (
                              <button
                                key={ed}
                                onClick={() => add(id, ed, false)}
                                className={`eyebrow rounded-full px-2.5 py-1 text-[9px] ${edition === ed ? "bg-ink text-paper" : "border border-ink/20 text-ink/60"}`}
                              >
                                {EDITION[ed]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <span className="eyebrow text-ink/60">On request</span>
                          <button onClick={() => remove(id)} className="eyebrow text-ink/40 hover:text-vermilion">Remove</button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {works.length > 0 && (
              <footer className="border-t border-ink/10 p-6">
                {works.length >= 2 && (
                  <p className="mb-4 rounded-xl bg-ink/5 p-3 text-sm text-ink/70">
                    <span className="eyebrow mr-2 text-vermilion">Set</span>
                    These {works.length} works will be quoted together as one set.
                  </p>
                )}
                <div className="mb-5 flex items-baseline justify-between">
                  <span className="eyebrow text-ink/50">Total</span>
                  <span className="serif text-3xl">Price on request</span>
                </div>
                <button
                  disabled
                  className="eyebrow w-full cursor-not-allowed rounded-full bg-ink/15 py-4 text-ink/50"
                  title="Online checkout is coming soon"
                >
                  Checkout — coming soon
                </button>
                <Link
                  href={enquireHref}
                  onClick={() => setOpen(false)}
                  className="eyebrow mt-2 block w-full rounded-full bg-ink py-4 text-center text-paper transition-colors hover:bg-vermilion hover:text-ink"
                  data-cursor="Write"
                >
                  Enquire about this {works.length >= 2 ? "set" : "work"} →
                </Link>
                <button onClick={clear} className="eyebrow mt-4 w-full text-center text-ink/40 hover:text-ink">Clear set</button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function CartButton() {
  const { items, setOpen } = useCart();
  return (
    <button onClick={() => setOpen(true)} className="pointer-events-auto eyebrow flex items-center gap-2" data-cursor="Your set">
      <span>Set</span>
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-current px-1.5 text-[10px]">
        {items.length}
      </span>
    </button>
  );
}
