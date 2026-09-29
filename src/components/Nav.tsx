"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { media, byId } from "@/lib/art";
import { getLenis } from "./SmoothScroll";

const extra = [
  { href: "/wall", title: "The Wall", cover: "paintings-p26-06", note: "All 196 works" },
  { href: "/about", title: "About", cover: "paintings-p19-17", note: "Bio · Words · Review" },
  { href: "/contact", title: "Contact", cover: "paintings-p26-11", note: "Get in touch" },
];

function KolkataClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () =>
      setT(
        new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()),
      );
    f();
    const i = setInterval(f, 1000);
    return () => clearInterval(i);
  }, []);
  return <span suppressHydrationWarning>{t || "--:--:--"}</span>;
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const items = [
    ...media.map((m) => ({ href: `/work/${m.key}`, title: m.title, cover: m.cover, note: m.numeral })),
    ...extra,
  ];
  const hoverArt = hover ? byId(hover) : null;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex items-start justify-between px-4 py-4 text-paper mix-blend-difference md:px-8 md:py-6">
        <Link href="/" className="pointer-events-auto serif text-2xl leading-none md:text-[28px]" data-cursor="Home">
          Susmit <em>Biswas</em>
        </Link>
        <div className="eyebrow hidden gap-10 pt-1 md:flex">
          <span>Kolkata · <KolkataClock /> IST</span>
          <span>Painter / Improviser</span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="pointer-events-auto eyebrow flex items-center gap-3 pt-1"
          data-cursor={open ? "Close" : "Menu"}
          aria-expanded={open}
        >
          <span>{open ? "Close" : "Index"}</span>
          <span className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-current transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0.5"}`} />
            <span className={`absolute left-0 h-px w-6 bg-current transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
          </span>
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-[70] overflow-y-auto bg-ink text-paper"
            initial={{ clipPath: "circle(0% at calc(100% - 48px) 32px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 48px) 32px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 48px) 32px)" }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            <AnimatePresence>
              {hoverArt && (
                <motion.div
                  key={hoverArt.id}
                  className="pointer-events-none fixed inset-0"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 0.55, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image src={hoverArt.src} alt="" fill sizes="100vw" className="object-cover blur-[2px]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
                </motion.div>
              )}
            </AnimatePresence>

            <nav className="relative flex min-h-full flex-col justify-center px-4 pb-16 pt-28 md:px-8">
              <ul>
                {items.map((it, i) => (
                  <motion.li
                    key={it.href}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-paper/10"
                  >
                    <Link
                      href={it.href}
                      onMouseEnter={() => setHover(it.cover)}
                      onMouseLeave={() => setHover(null)}
                      className="group flex items-baseline justify-between gap-6 py-1.5 md:py-2"
                      data-cursor="Enter"
                    >
                      <span className="serif text-[11vw] leading-[0.95] transition-all duration-700 ease-[var(--ease-out)] group-hover:translate-x-6 group-hover:italic md:text-[6.2vw]">
                        {it.title}
                      </span>
                      <span className="eyebrow text-paper/50 group-hover:text-paper">{it.note}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
