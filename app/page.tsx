import Hero from "@/components/Hero";
import ValueProp from "@/components/ValueProp";
import BuySell from "@/components/BuySell";
import Showcase from "@/components/Showcase";
import Listings from "@/components/Listings";
import PopularListings from "@/components/PopularListings";
import RecentlyViewed from "@/components/RecentlyViewed";
import ExploreMap from "@/components/ExploreMap";
import ExploreProjects from "@/components/ExploreProjects";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";

// Page narrative: what it is (Hero) → why it exists (ValueProp) →
// who it's for (BuySell) → the homes themselves (Showcase + Listings + Popular) →
// where (ExploreMap) → by project → objections (Faq) → close (Footer CTA).
export default function Home() {
  return (
    <main className="w-full overflow-clip bg-white">
      <Hero />
      <ValueProp />
      <BuySell />
      <Showcase />
      <Listings />
      <PopularListings />
      <RecentlyViewed />
      <ExploreMap />
      <ExploreProjects />
      <Faq />
      <Footer />
    </main>
  );
}
