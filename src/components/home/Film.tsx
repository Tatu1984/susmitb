"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { videos } from "@/data/content";

export default function Film() {
  const v = videos[0];
  const [play, setPlay] = useState(false);
  return (
    <section className="bg-ink px-4 py-28 md:px-8 md:py-40">
      <div className="eyebrow mb-10 flex justify-between text-paper/60">
        <span>(06) — Film</span>
        <span>Collaborative performance</span>
      </div>
      <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:items-end">
        <h2 className="serif text-[12vw] leading-[0.9] md:text-[5.2vw]">
          Improvisation with <em>saxophone</em> &amp; paintings
        </h2>
        <button
          onClick={() => setPlay(true)}
          className="group relative aspect-video w-full overflow-hidden bg-ink-2"
          data-cursor={play ? "" : "Play"}
          aria-label={`Play ${v.title}`}
        >
          <AnimatePresence mode="wait">
            {play ? (
              <motion.iframe
                key="f"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                title={v.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <motion.div key="p" exit={{ opacity: 0 }} className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`}
                  alt=""
                  className="h-full w-full object-cover opacity-70 grayscale transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-24 w-24 items-center justify-center rounded-full border border-paper/60 backdrop-blur-sm transition-transform duration-700 group-hover:scale-125 md:h-32 md:w-32">
                    <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-paper"><path d="M7 4v16l13-8z" /></svg>
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </section>
  );
}
