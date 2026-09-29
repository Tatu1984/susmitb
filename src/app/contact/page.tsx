import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";
import { artist } from "@/data/content";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <main className="min-h-[100svh] bg-ink px-4 pb-10 pt-32 md:px-8 md:pt-44">
      <div className="grid gap-16 md:grid-cols-[1fr_1fr]">
        <div>
          <span className="eyebrow text-paper/50">Get in touch</span>
          <h1 className="serif mt-6 text-[18vw] leading-[0.82] md:text-[9vw]">
            Drop me <em>a line</em>
          </h1>
          <p className="mt-8 max-w-md text-lg text-paper/70">
            Thank you very much for expressing an interest. Leave your name and email and I’ll be sure to get back to you —
            about a piece, a commission, or a performance with musicians.
          </p>
          <div className="eyebrow mt-12 flex flex-col gap-3 text-paper/70">
            <a href={artist.instagram} target="_blank" rel="noreferrer" className="link-u w-fit">Instagram — @susmitbiswasart ↗</a>
            <a href={artist.facebook} target="_blank" rel="noreferrer" className="link-u w-fit">Facebook — susmitbiswasart ↗</a>
            <span className="text-paper/40">{artist.city}</span>
          </div>
        </div>
        <Suspense>
          <ContactForm />
        </Suspense>
      </div>
    </main>
  );
}
