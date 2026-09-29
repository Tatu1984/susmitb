"use client";

import ArtImg from "@/components/ArtImg";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { byId } from "@/lib/art";

const bgs = ["light-lp-12", "light-lp-24", "light-lp-05", "light-lp-31", "light-lp-17", "light-lp-36"].map((id) => byId(id)!);
const INKS = ["255,170,70", "255,60,40", "190,255,90", "70,110,255", "90,255,140"];

export default function DrawWithLight() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [bg, setBg] = useState(0);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setBg((b) => (b + 1) % bgs.length), 6000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio, 2);
    const resize = () => {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const pen = { x: 0, y: 0, px: 0, py: 0, down: false, last: -1e9, ink: 0 };
    const sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);

    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      if (performance.now() - pen.last > 400) { pen.px = x; pen.py = y; pen.ink = (pen.ink + 1) % INKS.length; }
      pen.x = x; pen.y = y; pen.last = performance.now();
      setDrawn(true);
    };
    window.addEventListener("pointermove", move, { passive: true });

    const stroke = (x0: number, y0: number, x1: number, y1: number, rgb: string) => {
      ctx.globalCompositeOperation = "lighter";
      const d = Math.hypot(x1 - x0, y1 - y0);
      const w = Math.max(1.2, 5 - d * 0.05);
      ctx.strokeStyle = `rgba(${rgb},0.08)`; ctx.lineWidth = w * 7;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},0.35)`; ctx.lineWidth = w * 2.2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = `rgba(255,250,235,0.9)`; ctx.lineWidth = w * 0.45;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      if (Math.random() < 0.5)
        sparks.push({ x: x1, y: y1, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.8) * 3, life: 1 });
    };

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const W = c.clientWidth, H = c.clientHeight;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.028)";
      ctx.fillRect(0, 0, W, H);

      // ghost light-painter when nobody is drawing
      if (now - pen.last > 1800) {
        const t = (now - t0) / 1000;
        const gx = W * (0.5 + 0.3 * Math.sin(t * 0.9) + 0.1 * Math.sin(t * 3.7));
        const gy = H * (0.52 + 0.22 * Math.sin(t * 1.6 + 1) + 0.08 * Math.cos(t * 5.3));
        if (pen.px === 0) { pen.px = gx; pen.py = gy; }
        stroke(pen.px, pen.py, gx, gy, INKS[Math.floor(t / 6) % INKS.length]);
        pen.px = gx; pen.py = gy;
      } else {
        stroke(pen.px, pen.py, pen.x, pen.y, INKS[pen.ink]);
        pen.px = pen.x; pen.py = pen.y;
      }

      ctx.globalCompositeOperation = "lighter";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.life -= 0.025;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(255,230,180,${s.life})`;
        ctx.fillRect(s.x, s.y, 1.6, 1.6);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, []);

  const a = bgs[bg];
  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-black" data-cursor="Draw">
      <AnimatePresence>
        <motion.div
          key={a.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        >
          <ArtImg art={a} size="l" fill className="object-cover" eager />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black_95%)]" />
      <canvas ref={canvas} className="absolute inset-0 h-full w-full touch-pan-y" />

      <div className="pointer-events-none relative flex h-full flex-col justify-between px-4 py-24 md:px-8 md:py-28">
        <div className="eyebrow flex justify-between text-paper/60">
          <span>(04) — Light Paintings</span>
          <span>with Shailpik Biswas, photographer</span>
        </div>
        <div className="grid items-end gap-8 md:grid-cols-2">
          <h2 className="serif text-[15vw] leading-[0.85] md:text-[8.5vw]">
            Drawn in <em className="text-[color:#ffb45a] [text-shadow:0_0_40px_rgba(255,170,70,.6)]">air</em>,<br />
            held by <em>light</em>
          </h2>
          <div className="md:justify-self-end md:text-right">
            <p className="max-w-sm text-paper/75 md:ml-auto">
              Long exposures on Kolkata streets at night — the calligraphic gesture, freed from the paper.
              {drawn ? " Now it’s your turn — you’re already drawing." : " Move across the frame to draw with light."}
            </p>
            <Link href="/work/light" className="pointer-events-auto eyebrow mt-6 inline-block border-b border-paper/40 pb-1" data-cursor="Enter">
              See all 39 exposures →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
