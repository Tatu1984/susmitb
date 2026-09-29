"use client";

import { useEffect } from "react";

/**
 * Deterrents against casually saving artwork: no context menu, drag-out,
 * long-press save, Save Page or Print on images/canvases. (Screenshots can't
 * be prevented by any website.)
 */
export default function Protect() {
  useEffect(() => {
    const isArt = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("img, canvas, picture, [data-art], [data-protect]");
    const ctx = (e: MouseEvent) => isArt(e.target) && e.preventDefault();
    const drag = (e: DragEvent) => isArt(e.target) && e.preventDefault();
    const keys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && (k === "s" || k === "p")) e.preventDefault();
    };
    document.addEventListener("contextmenu", ctx);
    document.addEventListener("dragstart", drag);
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("contextmenu", ctx);
      document.removeEventListener("dragstart", drag);
      document.removeEventListener("keydown", keys);
    };
  }, []);
  return null;
}
