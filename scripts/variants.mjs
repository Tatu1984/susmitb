// Builds the private image variants served by /i/[token] (never from /public):
//   .art/s|m|l/<id>.jpg  — 480w thumb, 1000w tile, ≤1920w full
//   .art/x/<id>.jpg      — blurred + watermarked mask returned for invalid requests
//   .art/key             — HMAC signing key when ART_SIGNING_SECRET isn't set
import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const works = JSON.parse(readFileSync("src/data/artworks.json", "utf8"));
const OUT = ".art";
const SIZES = { s: 480, m: 1000, l: 1920 };
for (const d of [...Object.keys(SIZES), "x"]) mkdirSync(`${OUT}/${d}`, { recursive: true });
if (!existsSync(`${OUT}/key`)) writeFileSync(`${OUT}/key`, randomBytes(32).toString("hex"));

const exif = { IFD0: { Artist: "Susmit Biswas", Copyright: "© Susmit Biswas. All rights reserved." } };

const mark = (w, h) => {
  const rows = [];
  for (let y = -h; y < h * 2; y += 110)
    for (let x = -w; x < w * 2; x += 360)
      rows.push(`<text x="${x}" y="${y}" transform="rotate(-24 ${w / 2} ${h / 2})">© SUSMIT BISWAS</text>`);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="100%" height="100%" fill="rgba(11,10,9,.55)"/>
      <g font-family="Georgia, serif" font-size="30" fill="rgba(242,236,225,.28)" letter-spacing="4">${rows.join("")}</g>
      <rect x="0" y="${h / 2 - 50}" width="${w}" height="100" fill="rgba(11,10,9,.8)"/>
      <text x="50%" y="${h / 2 - 4}" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#f2ece1">© Susmit Biswas</text>
      <text x="50%" y="${h / 2 + 30}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" letter-spacing="3" fill="rgba(242,236,225,.7)">VIEW THE ARTWORK AT SUSMITBISWAS.COM</text>
    </svg>`,
  );
};

let made = 0;
for (const a of works) {
  const src = `art-src/${a.file}`;
  const mtime = statSync(src).mtimeMs;
  const fresh = (p) => existsSync(p) && statSync(p).mtimeMs >= mtime;
  for (const [k, w] of Object.entries(SIZES)) {
    const out = `${OUT}/${k}/${a.id}.jpg`;
    if (fresh(out)) continue;
    await sharp(src).resize({ width: Math.min(w, a.width) }).jpeg({ quality: k === "l" ? 86 : 80, mozjpeg: true }).withExif(exif).toFile(out);
    made++;
  }
  const out = `${OUT}/x/${a.id}.jpg`;
  if (!fresh(out)) {
    const w = 640, h = Math.round((640 * a.height) / a.width);
    const base = await sharp(src).resize({ width: w, height: h }).blur(22).modulate({ saturation: 0.5 }).toBuffer();
    await sharp(base).composite([{ input: mark(w, h) }]).jpeg({ quality: 60 }).withExif(exif).toFile(out);
    made++;
  }
}
console.log(`art variants: ${made} generated, ${works.length} works`);
