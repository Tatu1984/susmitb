import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { ART_DIR, SID_COOKIE, verify } from "@/lib/sign";

const common = {
  "Content-Type": "image/jpeg",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, noimageindex",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Disposition": 'inline; filename="susmit-biswas.jpg"',
};

// Opened in a tab, framed, or requested by another site → masked, never the artwork.
function embeddedHere(req: NextRequest) {
  const dest = req.headers.get("sec-fetch-dest");
  const site = req.headers.get("sec-fetch-site");
  if (dest && dest !== "image") return false;
  if (site && site !== "same-origin") return false;
  return true;
}

async function masked(id?: string) {
  const safe = id && /^[a-z0-9-]+$/.test(id) ? id : null;
  let body: Buffer;
  try {
    body = await readFile(path.join(ART_DIR, "x", `${safe ?? "paintings-p19-08"}.jpg`));
  } catch {
    body = await readFile(path.join(ART_DIR, "x", "paintings-p19-08.jpg"));
  }
  return new Response(new Uint8Array(body), { status: 403, headers: { ...common, "Cache-Control": "no-store" } });
}

export async function GET(req: NextRequest, ctx: RouteContext<"/i/[token]">) {
  const { token } = await ctx.params;
  const v = verify(token, req.cookies.get(SID_COOKIE)?.value);
  if (!v.ok) return masked(v.id);
  if (!embeddedHere(req)) return masked(v.id);
  try {
    const body = await readFile(path.join(ART_DIR, v.size, `${v.id}.jpg`));
    const left = Math.max(0, v.exp - Math.floor(Date.now() / 1000));
    return new Response(new Uint8Array(body), {
      headers: { ...common, "Cache-Control": `private, max-age=${left}, no-transform` },
    });
  } catch {
    return masked(v.id);
  }
}
