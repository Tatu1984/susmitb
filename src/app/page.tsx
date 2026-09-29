import Hero from "@/components/home/Hero";
import ChaosToOrder from "@/components/home/ChaosToOrder";
import Rooms from "@/components/home/Rooms";
import FlowFrenzy from "@/components/home/FlowFrenzy";
import DrawWithLight from "@/components/home/DrawWithLight";
import Voice from "@/components/home/Voice";
import Film from "@/components/home/Film";
import WallTeaser from "@/components/home/WallTeaser";
import Exhibitions from "@/components/home/Exhibitions";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <ChaosToOrder />
      <Rooms />
      <FlowFrenzy />
      <DrawWithLight />
      <Voice />
      <Film />
      <WallTeaser />
      <Exhibitions />
      <Footer />
    </main>
  );
}
