import Link from "next/link";
import { artist } from "@/data/content";
import { media } from "@/lib/art";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink px-4 pb-6 pt-28 text-paper md:px-8 md:pt-40">
      <div className="grid gap-16 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <span className="eyebrow text-paper/50">Enquiries, commissions, collaborations</span>
          <Link href="/contact" className="group mt-6 block" data-cursor="Write">
            <span className="serif block text-[16vw] leading-[0.85] md:text-[8vw]">
              Get in <em className="transition-colors duration-500 group-hover:text-accent">touch</em>
              <span className="inline-block transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-4 group-hover:-rotate-45">↗</span>
            </span>
          </Link>
        </div>
        <div className="eyebrow flex flex-col gap-3 text-paper/70">
          <span className="text-paper/40">Work</span>
          {media.map((m) => (
            <Link key={m.key} href={`/work/${m.key}`} className="link-u w-fit">{m.title}</Link>
          ))}
          <Link href="/wall" className="link-u w-fit">The Wall</Link>
        </div>
        <div className="eyebrow flex flex-col gap-3 text-paper/70">
          <span className="text-paper/40">Elsewhere</span>
          <a href={artist.instagram} target="_blank" rel="noreferrer" className="link-u w-fit">Instagram ↗</a>
          <a href={artist.facebook} target="_blank" rel="noreferrer" className="link-u w-fit">Facebook ↗</a>
          <Link href="/about" className="link-u w-fit">About</Link>
        </div>
      </div>
      <div className="serif mt-24 select-none whitespace-nowrap text-center text-[18.5vw] leading-[0.75] tracking-[-0.04em] text-paper/95">
        Susmit <em>Biswas</em>
      </div>
      <div className="eyebrow mt-6 flex justify-between border-t border-paper/15 pt-4 text-paper/40">
        <span>© {new Date().getFullYear()} All rights reserved</span>
        <span>{artist.city}</span>
      </div>
    </footer>
  );
}
