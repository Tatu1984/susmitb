import Link from "next/link";
import { soloShows, artist } from "@/data/content";

export default function Exhibitions() {
  return (
    <section className="bg-paper px-4 py-28 text-ink md:px-8 md:py-40">
      <div className="eyebrow mb-14 flex justify-between text-ink/60">
        <span>(08) — Solo exhibitions</span>
        <Link href="/about" className="link-u" data-cursor="Read">Full CV →</Link>
      </div>
      <ul>
        {soloShows.map((s) => (
          <li
            key={s.title}
            className="group grid grid-cols-[4rem_1fr] items-baseline gap-4 border-t border-ink/15 py-5 transition-colors duration-500 hover:bg-ink hover:text-paper md:grid-cols-[8rem_1fr_1fr_8rem] md:px-4"
          >
            <span className="mono text-sm">{s.year}</span>
            <span className="serif text-3xl leading-tight transition-transform duration-500 group-hover:translate-x-3 group-hover:italic md:text-5xl">
              {s.title}
            </span>
            <span className="col-start-2 text-ink/60 group-hover:text-paper/60 md:col-start-auto">
              {s.venue}, {s.city}
            </span>
            <span className="eyebrow hidden text-right text-ink/50 group-hover:text-paper/50 md:block">{s.date}</span>
          </li>
        ))}
      </ul>
      <p className="eyebrow mt-16 text-ink/60">
        Collectors in {artist.collectors.join(" · ")}
      </p>
    </section>
  );
}
