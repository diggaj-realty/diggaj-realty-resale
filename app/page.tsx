import Hero from "@/components/Hero";
import ValueProp from "@/components/ValueProp";
import Showcase from "@/components/Showcase";
import HowItWorks from "@/components/HowItWorks";
import BuySell from "@/components/BuySell";
import SaveMore from "@/components/SaveMore";
import ExploreMap from "@/components/ExploreMap";
import Listings from "@/components/Listings";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="w-full overflow-clip bg-white">
      <Hero />
      <ValueProp />
      <Showcase />
      <HowItWorks />
      <BuySell />
      <SaveMore />
      <Listings />
      <ExploreMap />
      <Footer />
    </main>
  );
}
