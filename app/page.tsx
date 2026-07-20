import Hero from "@/components/Hero";
import ValueProp from "@/components/ValueProp";
import HowItWorks from "@/components/HowItWorks";
import BuySell from "@/components/BuySell";
import Showcase from "@/components/Showcase";
import Listings from "@/components/Listings";
import ExploreMap from "@/components/ExploreMap";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";

// Page narrative: what it is (Hero) → why it exists (ValueProp) →
// how it works (HowItWorks) → who it's for (BuySell) → the homes
// themselves (Showcase + Listings) → where (ExploreMap) →
// objections (Faq) → close (Footer CTA).
export default function Home() {
  return (
    <main className="w-full overflow-clip bg-white">
      <Hero />
      <ValueProp />
      <HowItWorks />
      <BuySell />
      <Showcase />
      <Listings />
      <ExploreMap />
      <Faq />
      <Footer />
    </main>
  );
}
