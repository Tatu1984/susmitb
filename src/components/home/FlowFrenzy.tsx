"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { byId, plate } from "@/lib/art";
import ArtActions from "@/components/ArtActions";

const picks = [
  "paintings-p26-01", "paintings-p19-04", "paintings-p26-12", "paintings-p19-25", "paintings-p26-15",
  "paintings-p19-06", "paintings-p26-20", "paintings-p19-11", "paintings-p26-28", "paintings-p19-16",
].map((id) => byId(id)!);

const heights = ["62vh", "48vh", "70vh", "54vh", "66vh", "44vh", "72vh", "52vh", "64vh", "58vh"];
const offsets = ["0vh", "14vh", "-6vh", "10vh", "-10vh", "18vh", "-4vh", "8vh", "-8vh", "12vh"];

export default function FlowFrenzy() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const measure = () => track.current && setDist(track.current.scrollWidth - window.innerWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bgx = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const vel = useVelocity(scrollYProgress);
  const skew = useSpring(useTransform(vel, [-2, 2], [8, -8]), { stiffness: 200, damping: 30 });

  return (
    <section ref={ref} className="relative h-[480vh] bg-ink">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div
          className="serif pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[34vw] italic leading-none text-paper/[0.06]"
          style={{ x: bgx, left: "-40%" }}
        >
          Flow &amp; Frenzy
        </motion.div>

        <div className="eyebrow absolute left-4 right-4 top-24 z-10 flex justify-between text-paper/60 md:left-8 md:right-8">
          <span>(03) — Flow and Frenzy</span>
          <span>Gallery Manora, Bangalore · 2017</span>
        </div>

        <motion.div ref={track} className="flex h-full w-max items-center gap-[6vw] pl-[8vw] pr-[8vw]" style={{ x }}>
          <div className="w-[70vw] shrink-0 md:w-[34vw]">
            <h2 className="serif text-[14vw] leading-[0.85] md:text-[7vw]">
              Storms of <em>intense</em> feeling
            </h2>
            <p className="mt-8 max-w-sm text-paper/70">
              “Subdued shades are frequently highlighted by commas of black or swirls of red.” Scroll to walk the room.
            </p>
          </div>
          {picks.map((a, i) => (
            <div
              key={a.id}
              className="group relative shrink-0"
              style={{ height: heights[i], marginTop: offsets[i], aspectRatio: `${a.width}/${a.height}` }}
            >
              <Link href={`/work/paintings?w=${a.id}`} data-cursor="View" className="block h-full w-full">
              <motion.div data-art className="relative h-full w-full overflow-hidden" style={{ skewX: skew }}>
                <Image
                  src={a.src}
                  alt={`Painting, plate ${plate(a)}`}
                  fill
                  sizes="40vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-110"
                />
              </motion.div>
              </Link>
              <div className="eyebrow mt-3 flex items-center justify-between gap-4 text-paper/50">
                <span className="flex items-center gap-2">
                  <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                  Plate {plate(a)}
                </span>
                <ArtActions id={a.id} className="w-52 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
