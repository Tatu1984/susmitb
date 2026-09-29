"use client";

import { useEffect, useState } from "react";

export type Size = "s" | "m" | "l";

// Signed URLs are one-off and short-lived; cache them until shortly before expiry.
const cache = new Map<string, { url: string; exp: number }>();
const waiting = new Map<string, ((u: string) => void)[]>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  timer = null;
  const keys = [...waiting.keys()];
  const cbs = new Map(waiting);
  waiting.clear();
  for (let i = 0; i < keys.length; i += 200) {
    const chunk = keys.slice(i, i + 200);
    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: chunk.map((k) => k.split("|")) }),
        credentials: "same-origin",
      });
      const { urls, ttl } = (await res.json()) as { urls: Record<string, string>; ttl: number };
      const exp = Date.now() + (ttl - 60) * 1000;
      for (const k of chunk) {
        const url = urls?.[k];
        if (!url) continue;
        cache.set(k, { url, exp });
        cbs.get(k)?.forEach((cb) => cb(url));
      }
    } catch {
      /* leave unresolved; the tile keeps its colour placeholder */
    }
  }
}

export function signArt(id: string, size: Size): Promise<string> {
  const k = `${id}|${size}`;
  const hit = cache.get(k);
  if (hit && hit.exp > Date.now()) return Promise.resolve(hit.url);
  return new Promise((resolve) => {
    waiting.set(k, [...(waiting.get(k) ?? []), resolve]);
    timer ??= setTimeout(flush, 16);
  });
}

export function useArtSrc(id: string, size: Size) {
  const k = `${id}|${size}`;
  const hit = cache.get(k);
  const [url, setUrl] = useState<string | undefined>(hit && hit.exp > Date.now() ? hit.url : undefined);
  useEffect(() => {
    let live = true;
    signArt(id, size).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [id, size]);
  return url;
}
