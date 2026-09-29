"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ink-drop cursor. Elements opt in to a label with data-cursor="View" etc.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const lag = { ...pos };
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(t?.dataset.cursor ? t.dataset.cursor : null);
    };
    const tick = () => {
      lag.x += (pos.x - lag.x) * 0.16;
      lag.y += (pos.y - lag.y) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;
  const big = label !== null;
  return (
    <>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference">
        <div className="-ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-white" />
      </div>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[99]">
        <div
          className="flex items-center justify-center rounded-full transition-all duration-500 ease-[var(--ease-out)]"
          style={{
            width: big ? 96 : 34,
            height: big ? 96 : 34,
            marginLeft: big ? -48 : -17,
            marginTop: big ? -48 : -17,
            background: big ? "var(--accent)" : "transparent",
            border: big ? "0" : "1px solid rgba(242,236,225,.45)",
            mixBlendMode: big ? "normal" : "difference",
          }}
        >
          <span
            className="eyebrow text-ink transition-opacity duration-300"
            style={{ opacity: big && label ? 1 : 0, fontSize: 10 }}
          >
            {label}
          </span>
        </div>
      </div>
    </>
  );
}
