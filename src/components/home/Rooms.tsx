"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { useState } from "react";
import { byId, byMedium, media } from "@/lib/art";

export default function Rooms() {
  const [active, setActive] = useState<number | null>(null);
  const x = useSpring(0, { stiffness: 150, damping: 20, mass: 0.4 });
  const y = useSpring(0, { stiffness: 150, damping: 20, mass: 0.4 });
  const m = active !== null ? media[active] : null;
  const previews = m ? byMedium(m.key).slice(0, 3) : [];

  return (
    <section
      className="relative overflow-hidden px-4 py-28 transition-colors duration-700 md:px-8 md:py-40"
      style={{ background: m ? (byId(m.cover)!.color) : "var(--ink)" }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-ink/55" />
      <div className="relative">
        <div className="eyebrow mb-14 flex justify-between text-paper/60">
          <span>(02) — Five rooms</span>
          <span>{media.reduce((n, md) => n + byMedium(md.key).length, 0)} works</span>
        </div>

        <ul onPointerLeave={() => setActive(null)}>
          {media.map((md, i) => (
            <li key={md.key} className="border-t border-paper/15 last:border-b">
              <Link
                href={`/work/${md.key}`}
                onPointerEnter={() => setActive(i)}
                className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-5 md:grid-cols-[6rem_1fr_28rem_6rem] md:py-7"
                data-cursor="Enter"
              >
                <span className="mono text-sm text-paper/50">{md.numeral}</span>
                <span
                  className={`serif text-[13vw] leading-[0.9] transition-all duration-700 ease-[var(--ease-out)] md:text-[7.5vw] ${
                    active !== null && active !== i ? "opacity-25 blur-[1px]" : ""
                  } group-hover:italic`}
                >
                  {md.title}
                </span>
                <span className="hidden text-base leading-snug text-paper/70 md:block">{md.line}</span>
                <span className="mono text-right text-sm text-paper/50">{String(byMedium(md.key).length).padStart(3, "0")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <motion.div className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block" style={{ x, y }}>
        <AnimatePresence>
          {previews.map((a, k) => (
            <motion.div
              key={a.id}
              className="absolute w-[240px] origin-bottom"
              initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: (k - 1) * 9, x: -120 + (k - 1) * 70, y: -170 - k * 6 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: k * 0.04 }}
            >
              <Image src={a.src} alt="" width={a.width} height={a.height} sizes="240px" className="h-auto w-full shadow-2xl" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
