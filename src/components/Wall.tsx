"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Lightbox from "./Lightbox";
import { TileActions } from "./ArtActions";
import { artworks, media, plate, type MediumKey } from "@/lib/art";

const mod = (a: number, n: number) => ((a % n) + n) % n;
// Stable shuffle — neighbouring tiles shouldn't come from the same series.
const shuffle = <T,>(arr: T[]) => {
  const out = [...arr];
  let s = 7;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
const all = shuffle(artworks);

export default function Wall() {
  const [filter, setFilter] = useState<MediumKey | "all">("all");
  const list = useMemo(() => (filter === "all" ? all : all.filter((a) => a.medium === filter)), [filter]);
  const C = Math.ceil(Math.sqrt(list.length));
  const R = Math.ceil(list.length / C);

  const [cell, setCell] = useState({ w: 260, h: 340, g: 18 });
  const [range, setRange] = useState({ i0: 0, i1: 0, j0: 0, j1: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const stage = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const st = useRef({ x: 0, y: 0, vx: 0, vy: 0, down: false, lx: 0, ly: 0, moved: 0 });

  useEffect(() => {
    const sz = () => {
      const w = innerWidth < 768 ? 150 : 260;
      setCell({ w, h: Math.round(w * 1.3), g: innerWidth < 768 ? 10 : 18 });
    };
    sz();
    addEventListener("resize", sz);
    return () => removeEventListener("resize", sz);
  }, []);

  useEffect(() => {
    const s = st.current;
    const CW = cell.w + cell.g, CH = cell.h + cell.g;
    let raf = 0, lastKey = "";
    // start centred-ish with a gentle drift
    if (s.x === 0 && s.y === 0) { s.x = -CW * 3; s.y = -CH * 2; s.vx = -6; s.vy = -3; }

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!s.down) {
        s.x += s.vx; s.y += s.vy;
        s.vx *= 0.94; s.vy *= 0.94;
      }
      const speed = Math.min(60, Math.hypot(s.vx, s.vy));
      if (layer.current) layer.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      if (stage.current) {
        const k = 1 - speed / 700;
        stage.current.style.transform = `scale(${k}) skew(${-s.vx * 0.06}deg, ${-s.vy * 0.04}deg)`;
      }
      const W = innerWidth, H = innerHeight;
      const i0 = Math.floor(-s.x / CW) - 1, i1 = Math.floor((-s.x + W) / CW) + 1;
      const j0 = Math.floor(-s.y / CH) - 2, j1 = Math.floor((-s.y + H) / CH) + 1;
      const key = `${i0},${i1},${j0},${j1}`;
      if (key !== lastKey) {
        lastKey = key;
        setRange({ i0, i1, j0, j1 });
        setCoords({ x: Math.round(-s.x), y: Math.round(-s.y) });
      }
    };
    raf = requestAnimationFrame(tick);

    const el = stage.current!.parentElement!;
    const down = (e: PointerEvent) => {
      s.down = true; s.moved = 0; s.lx = e.clientX; s.ly = e.clientY; s.vx = s.vy = 0;
    };
    const move = (e: PointerEvent) => {
      if (!s.down) return;
      const dx = e.clientX - s.lx, dy = e.clientY - s.ly;
      s.x += dx; s.y += dy; s.vx = dx; s.vy = dy; s.moved += Math.abs(dx) + Math.abs(dy);
      s.lx = e.clientX; s.ly = e.clientY;
    };
    const up = () => { s.down = false; };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      s.vx -= e.deltaX * 0.08;
      s.vy -= e.deltaY * 0.08;
    };
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [cell]);

  const tiles = [];
  const CW = cell.w + cell.g, CH = cell.h + cell.g;
  for (let i = range.i0; i <= range.i1; i++) {
    for (let j = range.j0; j <= range.j1; j++) {
      const idx = (mod(i, C) + mod(j, R) * C) % list.length;
      const a = list[idx];
      tiles.push(
        <div
          key={`${i}:${j}`}
          role="button"
          data-art
          className="group absolute overflow-hidden"
          style={{ left: i * CW, top: j * CH + (mod(i, 2) ? cell.h * 0.45 : 0), width: cell.w, height: cell.h, background: a.color }}
          onClick={() => st.current.moved < 8 && setOpen(idx)}
          data-cursor="View"
        >
          <Image
            src={a.src}
            alt=""
            fill
            sizes="260px"
            draggable={false}
            className="pointer-events-none object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-110"
          />
          <span className="eyebrow absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-[9px] text-paper opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            {plate(a)}
          </span>
          <TileActions id={a.id} />
        </div>,
      );
    }
  }

  return (
    <>
    <main className="fixed inset-0 touch-none select-none overflow-hidden bg-ink" data-cursor="Drag">
      <div ref={stage} className="absolute inset-0 origin-center will-change-transform">
        <div ref={layer} className="absolute left-0 top-0 will-change-transform">
          {tiles}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(11,10,9,.85)_100%)]" />

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center mix-blend-difference"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.6, duration: 1.2 }}
      >
        <h1 className="serif text-[20vw] leading-none md:text-[12vw]">The <em>Wall</em></h1>
        <p className="eyebrow mt-4">Drag · Scroll · Fling</p>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 md:flex-row md:items-end md:justify-between md:p-8">
        <div className="eyebrow hidden text-paper/50 mix-blend-difference md:block">
          x {String(coords.x).padStart(6, " ")} · y {String(coords.y).padStart(6, " ")}
          <br />
          {list.length} works in view
        </div>
        <div className="flex gap-1.5 overflow-x-auto rounded-full border border-paper/15 bg-ink/70 p-1.5 backdrop-blur-xl [scrollbar-width:none]">
          {[{ key: "all", title: "All" } as const, ...media].map((m) => (
            <button
              key={m.key}
              onClick={() => setFilter(m.key)}
              className={`eyebrow shrink-0 rounded-full px-4 py-2 transition-colors ${filter === m.key ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"}`}
              data-cursor=""
            >
              {m.title}
            </button>
          ))}
        </div>
      </div>

    </main>
    <Lightbox items={list} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}
