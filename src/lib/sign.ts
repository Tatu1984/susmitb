import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

export const SIZES = ["s", "m", "l"] as const;
export type Size = (typeof SIZES)[number];
export const TTL_S = 600; // signed links live 10 minutes
export const SID_COOKIE = "sb_sid";
export const ART_DIR = path.join(process.cwd(), ".art");

let secret: Buffer | null = null;
function key() {
  if (!secret) {
    const env = process.env.ART_SIGNING_SECRET;
    secret = Buffer.from(env && env.length >= 32 ? env : readFileSync(path.join(ART_DIR, "key"), "utf8").trim());
  }
  return secret;
}

const b64 = (b: Buffer) => b.toString("base64url");
const mac = (data: string) => b64(createHmac("sha256", key()).update(data).digest()).slice(0, 27);
export const sidTag = (sid: string) => b64(createHash("sha256").update(sid).digest()).slice(0, 10);
export const newSid = () => b64(randomBytes(18));

/** One-off URL: random nonce, expiry, and bound to the viewer's session. */
export function sign(id: string, size: Size, sid: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL_S;
  const body = b64(Buffer.from([id, size, exp, b64(randomBytes(6)), sidTag(sid)].join("|")));
  return `/i/${body}.${mac(body)}`;
}

export type Verdict =
  | { ok: true; id: string; size: Size; exp: number }
  | { ok: false; id?: string; reason: string };

export function verify(token: string, sid: string | undefined): Verdict {
  const [body, sig] = token.split(".");
  if (!body || !sig) return { ok: false, reason: "malformed" };
  const want = Buffer.from(mac(body)), got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return { ok: false, reason: "signature" };
  const [id, size, exp, , tag] = Buffer.from(body, "base64url").toString().split("|");
  if (!SIZES.includes(size as Size)) return { ok: false, id, reason: "size" };
  if (Number(exp) < Date.now() / 1000) return { ok: false, id, reason: "expired" };
  if (!sid || sidTag(sid) !== tag) return { ok: false, id, reason: "session" };
  return { ok: true, id, size: size as Size, exp: Number(exp) };
}
