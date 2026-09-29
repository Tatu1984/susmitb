# Susmit Biswas — A Game of Order and Chaos

Portfolio site for Kolkata artist Susmit Biswas. Next.js 16, Tailwind v4, motion, lenis, raw WebGL2.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

- `src/components/PaintField.tsx` — WebGL "wet paint" hero
- `src/data/content.ts` — bio, words, review, exhibitions
- `src/data/artworks.json` — artwork catalogue; regenerate with `node scripts/catalog.mjs` after adding images to `public/art/<medium>/`
