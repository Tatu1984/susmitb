import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Susmit Biswas — A Game of Order and Chaos", template: "%s — Susmit Biswas" },
  description:
    "Paintings, digital works, drawings, brush & ink and light paintings by Kolkata artist Susmit Biswas.",
};

export const viewport: Viewport = { themeColor: "#0b0a09" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable}`}>
      <body>
        <SmoothScroll />
        <Nav />
        {children}
        <Cursor />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
