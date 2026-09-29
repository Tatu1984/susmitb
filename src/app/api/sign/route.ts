import { NextRequest, NextResponse } from "next/server";
import { artworks } from "@/lib/art";
import { SID_COOKIE, SIZES, TTL_S, newSid, sign, type Size } from "@/lib/sign";

const ids = new Set(artworks.map((a) => a.id));
// Crude per-session throttle (per server instance) — enough to slow bulk scraping.
const hits = new Map<string, { n: number; t: number }>();
const LIMIT = 1500, WINDOW = 10 * 60_000;

export async function POST(req: NextRequest) {
  const site = req.headers.get("sec-fetch-site");
  const origin = req.headers.get("origin");
  if ((site && site !== "same-origin") || (origin && new URL(origin).host !== req.headers.get("host")))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let items: [string, Size][] = [];
  try {
    items = ((await req.json()).items ?? []).slice(0, 250);
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const existing = req.cookies.get(SID_COOKIE)?.value;
  const sid = existing ?? newSid();

  const now = Date.now();
  const h = hits.get(sid);
  const rec = h && now - h.t < WINDOW ? h : { n: 0, t: now };
  rec.n += items.length;
  hits.set(sid, rec);
  if (rec.n > LIMIT) return NextResponse.json({ error: "slow down" }, { status: 429 });

  const urls: Record<string, string> = {};
  for (const [id, size] of items)
    if (ids.has(id) && SIZES.includes(size)) urls[`${id}|${size}`] = sign(id, size, sid);

  const res = NextResponse.json({ urls, ttl: TTL_S }, { headers: { "Cache-Control": "no-store" } });
  if (!existing)
    res.cookies.set(SID_COOKIE, sid, {
      httpOnly: true,
      sameSite: "strict",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  return res;
}
