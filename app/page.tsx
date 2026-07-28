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
import HomeFloatingAi from "@/components/ai/HomeFloatingAi";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Diggaj Realty",
  url: "https://diggajrealty.com",
  description:
    "All-in-one resale property platform with verified listings and a dedicated agent to help you buy or sell.",
  areaServed: "IN",
};

// Page narrative: what it is (Hero) → why it exists (ValueProp) →
// who it's for (BuySell) → the homes themselves (Showcase + Listings + Popular) →
// where (ExploreMap) → by project → objections (Faq) → close (Footer CTA).
export default function Home() {
  return (
    <main className="w-full overflow-clip bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />
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
      <HomeFloatingAi />
    </main>
  );
}
