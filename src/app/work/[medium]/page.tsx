import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import { byMedium, media, type MediumKey } from "@/lib/art";

export function generateStaticParams() {
  return media.map((m) => ({ medium: m.key }));
}

export async function generateMetadata({ params }: PageProps<"/work/[medium]">): Promise<Metadata> {
  const { medium } = await params;
  const m = media.find((x) => x.key === medium);
  return { title: m?.title ?? "Work" };
}

export default async function WorkPage({ params }: PageProps<"/work/[medium]">) {
  const { medium } = await params;
  const i = media.findIndex((x) => x.key === medium);
  if (i < 0) notFound();
  const m = media[i];
  const next = media[(i + 1) % media.length];
  return (
    <main>
      <Gallery medium={m} items={byMedium(m.key as MediumKey)} next={next} />
      <Footer />
    </main>
  );
}
