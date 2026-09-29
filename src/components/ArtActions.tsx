"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

/**
 * Enquire / Buy now pair shown on every artwork tile.
 * Hover-reveal on desktop, always visible on touch.
 */
export default function ArtActions({ id, className = "" }: { id: string; className?: string }) {
  const { add, has } = useCart();
  const inSet = has(id);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div
      className={`pointer-events-auto flex gap-1.5 ${className}`}
      onClick={stop}
      onPointerDown={stop}
    >
      <Link
        href={`/contact?work=${id}`}
        className="eyebrow flex-1 rounded-full border border-paper/50 bg-ink/40 px-3 py-2 text-center text-[10px] text-paper backdrop-blur-md transition-colors hover:border-paper hover:bg-ink/70"
        data-cursor="Write"
      >
        Enquire
      </Link>
      <button
        onClick={() => add(id)}
        className={`eyebrow flex-1 rounded-full px-3 py-2 text-[10px] transition-colors ${
          inSet ? "bg-accent text-ink" : "bg-paper text-ink hover:bg-accent"
        }`}
        data-cursor={inSet ? "In set" : "Buy"}
      >
        {inSet ? "In your set ✓" : "Buy now"}
      </button>
    </div>
  );
}

/** Overlay variant: slides up from the bottom of an image tile. */
export function TileActions({ id }: { id: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-2 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent p-2 pt-10 opacity-0 transition-all duration-500 ease-[var(--ease-out)] group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 md:p-3">
      <ArtActions id={id} />
    </div>
  );
}
