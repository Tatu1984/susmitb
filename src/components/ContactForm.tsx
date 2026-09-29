"use client";

import ArtImg from "@/components/ArtImg";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { byId, mediumOf, plate } from "@/lib/art";

function Field({ label, name, type = "text", area }: { label: string; name: string; type?: string; area?: boolean }) {
  const cls =
    "peer w-full border-b border-paper/25 bg-transparent pb-3 pt-7 text-2xl outline-none transition-colors focus:border-accent serif placeholder-transparent";
  return (
    <label className="relative block">
      {area ? <textarea name={name} rows={4} placeholder={label} className={`${cls} resize-none`} required /> : <input name={name} type={type} placeholder={label} className={cls} required />}
      <span className="eyebrow absolute left-0 top-0 text-paper/50 transition-colors peer-focus:text-accent">{label}</span>
    </label>
  );
}

export default function ContactForm() {
  const params = useSearchParams();
  const single = params.get("work");
  // ?works=id:edition,id:edition comes from the "Your set" drawer
  const picked = (single ? [`${single}:original`] : (params.get("works") ?? "").split(","))
    .map((x) => {
      const [id, ed] = x.split(":");
      const art = byId(id);
      return art ? { art, ed: ed === "print" ? "Fine-art print" : "Original" } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  const [sent, setSent] = useState(false);

  return (
    <div className="md:pt-16">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="serif text-6xl leading-tight">
            Thank you — <em>message received.</em>
            <p className="eyebrow mt-6 text-paper/50">(Design preview: the form isn’t connected to email yet.)</p>
          </motion.div>
        ) : (
          <motion.form
            key="f"
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {picked.length > 0 && (
              <div className="rounded-2xl border border-paper/15 p-3">
                <span className="eyebrow text-paper/50">
                  {picked.length > 1 ? `Enquiry for a set of ${picked.length}` : "Enquiry for"}
                </span>
                <ul className="mt-3 flex flex-col gap-3">
                  {picked.map(({ art, ed }) => (
                    <li key={art.id} className="flex items-center gap-4">
                      <div data-art className="relative h-14 w-14 shrink-0 overflow-hidden">
                        <ArtImg art={art} size="s" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="serif text-xl leading-none">{mediumOf(art.medium).title} — Plate {plate(art)}</p>
                        <p className="eyebrow mt-1 text-paper/50">{ed}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Field label="Your name" name="name" />
            <Field label="Email" name="email" type="email" />
            <Field label="Message" name="message" area />
            <button
              className="group mt-4 flex items-center justify-between rounded-full bg-paper px-8 py-5 text-ink transition-colors duration-500 hover:bg-accent"
              data-cursor="Send"
            >
              <span className="eyebrow">Send message</span>
              <span className="transition-transform duration-500 group-hover:translate-x-2">→</span>
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
