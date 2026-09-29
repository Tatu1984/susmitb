import type { Metadata } from "next";
import Wall from "@/components/Wall";

export const metadata: Metadata = { title: "The Wall" };

export default function WallPage() {
  return <Wall />;
}
