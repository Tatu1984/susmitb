import data from "@/data/artworks.json";

export type MediumKey = "paintings" | "digital" | "drawings" | "brush-ink" | "light";

export type Artwork = {
  id: string;
  medium: MediumKey;
  file: string;
  width: number;
  height: number;
  color: string;
  no: number;
};

export type Medium = {
  key: MediumKey;
  title: string;
  numeral: string;
  tone: "dark" | "paper";
  line: string;
  cover: string;
};

export const artworks = data as Artwork[];

export const media: Medium[] = [
  { key: "paintings", title: "Paintings", numeral: "I", tone: "dark", line: "Acrylic storms on flat fields of cobalt, vermilion and cadmium.", cover: "paintings-p19-08" },
  { key: "digital", title: "Digital", numeral: "II", tone: "dark", line: "Technology used to blur what can and can’t be done by hand.", cover: "digital-g-10" },
  { key: "drawings", title: "Drawings", numeral: "III", tone: "paper", line: "The pleasure of mark-making, pared down to line and pressure.", cover: "drawings-d-05" },
  { key: "brush-ink", title: "Brush & Ink", numeral: "IV", tone: "paper", line: "The autonomy of the calligraphic gesture — magenta, black, paper.", cover: "brush-ink-bi-04" },
  { key: "light", title: "Light Paintings", numeral: "V", tone: "dark", line: "Gestures drawn in air on Kolkata streets, with photographer Shailpik Biswas.", cover: "light-lp-12" },
];

export const byId = (id: string) => artworks.find((a) => a.id === id);
export const byMedium = (m: MediumKey) => artworks.filter((a) => a.medium === m);
export const mediumOf = (m: MediumKey) => media.find((x) => x.key === m)!;

export const plate = (a: Artwork) => `${mediumOf(a.medium).numeral}.${String(a.no).padStart(2, "0")}`;

// Paintings that read well full-bleed in the hero shader.
export const heroIds = [
  "paintings-p19-08",
  "paintings-p26-01",
  "paintings-p19-12",
  "paintings-p19-26",
  "paintings-p26-28",
  "paintings-p19-02",
  "paintings-p26-10",
];
