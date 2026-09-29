"use client";

import { useState } from "react";
import type { Artwork } from "@/lib/art";
import { useArtSrc, type Size } from "@/lib/artSrc";

/**
 * Artwork image served through a one-off signed URL (/i/<token>).
 * Never exposes a stable file path; the <img> itself takes no pointer events.
 */
export default function ArtImg({
  art,
  size = "m",
  fill,
  className = "",
  alt = "",
  eager,
}: {
  art: Artwork;
  size?: Size;
  fill?: boolean;
  className?: string;
  alt?: string;
  eager?: boolean;
}) {
  const src = useArtSrc(art.id, size);
  const [loaded, setLoaded] = useState(false);
  if (!src) return fill ? null : <span className="block w-full" style={{ aspectRatio: `${art.width}/${art.height}`, background: art.color }} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={art.width}
      height={art.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      referrerPolicy="same-origin"
      onLoad={() => setLoaded(true)}
      onContextMenu={(e) => e.preventDefault()}
      className={`pointer-events-none select-none transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${
        fill ? "absolute inset-0 h-full w-full" : ""
      } ${className}`}
    />
  );
}
