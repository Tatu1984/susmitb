"use client";

import { useEffect } from "react";

/**
 * Blanks every artwork the instant a screenshot looks likely:
 *  - PrintScreen (Windows) — also overwrites the clipboard
 *  - Cmd/Win + Shift held — the lead-in to macOS ⌘⇧3/4/5 and Windows Snipping (Win⇧S)
 *  - window loses focus / tab hidden — screenshot tools and recorders take focus
 * Toggles a class on <html> directly (no React render) so it paints in the same frame.
 * The browser can't see phone hardware-button screenshots; this is a deterrent, not DRM.
 */
export default function ScreenshotShield() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let armedAt = 0;

    const on = (ms = 8000) => {
      root.classList.add("shield");
      armedAt = performance.now();
      clearTimeout(timer);
      timer = setTimeout(off, ms);
    };
    const off = () => {
      clearTimeout(timer);
      root.classList.remove("shield");
    };
    const offSoon = (ms = 350) => {
      clearTimeout(timer);
      timer = setTimeout(off, ms);
    };
    const scrubClipboard = () => {
      navigator.clipboard?.writeText("© Susmit Biswas — artwork is protected.").catch(() => {});
    };

    const down = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        on(4000);
        scrubClipboard();
        return;
      }
      const mod = e.key === "Meta" || e.key === "Shift" || e.key === "OS";
      if (mod && e.shiftKey && (e.metaKey || e.getModifierState?.("OS"))) {
        on();
        return;
      }
      // A real key reached the page, so the chord wasn't a screenshot (the OS swallows ⌘⇧3/4/5).
      if (!mod && root.classList.contains("shield") && !e.key.startsWith("Print")) off();
    };
    const up = (e: KeyboardEvent) => {
      // Windows often only reports PrintScreen on keyup.
      if (e.key === "PrintScreen") {
        on(4000);
        scrubClipboard();
      }
    };
    const blur = () => {
      // Clicking into the YouTube iframe also blurs the window — not a screenshot.
      setTimeout(() => {
        if (document.activeElement?.tagName === "IFRAME") return;
        on(60_000);
      }, 0);
    };
    const focus = () => offSoon(400);
    const vis = () => (document.hidden ? on(60_000) : offSoon(400));
    const pointer = () => {
      if (root.classList.contains("shield") && performance.now() - armedAt > 250) offSoon(120);
    };

    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up, true);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("pointerdown", pointer, true);
    return () => {
      clearTimeout(timer);
      off();
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up, true);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("pointerdown", pointer, true);
    };
  }, []);

  return (
    <div className="shield-panel" aria-hidden>
      <div className="text-center">
        <p className="serif text-[12vw] leading-none md:text-7xl">
          © Susmit <em>Biswas</em>
        </p>
        <p className="eyebrow mt-5 text-paper/60">Artwork is protected — screen capture is disabled</p>
        <p className="eyebrow mt-10 text-paper/35">Click anywhere to continue</p>
      </div>
    </div>
  );
}
