// Builds src/data/artworks.json: dimensions + dominant colour for every image in art-src.
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";

const MEDIA = {
  paintings: "Paintings",
  digital: "Digital",
  drawings: "Drawings",
  "brush-ink": "Brush & Ink",
  light: "Light Paintings",
};
const out = [];
for (const dir of Object.keys(MEDIA)) {
  const files = readdirSync(`art-src/${dir}`).filter((f) => f.endsWith(".jpg")).sort().reverse();
  let n = 0;
  for (const f of files) {
    const img = sharp(`art-src/${dir}/${f}`);
    const { width, height } = await img.metadata();
    const { dominant } = await img.stats();
    const hex = "#" + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("");
    n++;
    out.push({
      id: `${dir}-${f.replace(".jpg", "")}`,
      medium: dir,
      file: `${dir}/${f}`,
      width, height, color: hex,
      no: n,
    });
  }
}
writeFileSync("src/data/artworks.json", JSON.stringify(out, null, 1));
console.log(out.length, "works");
