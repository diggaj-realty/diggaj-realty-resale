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
import LeadSection from "@/components/LeadSection";
import StickyLeadBar from "@/components/StickyLeadBar";
import HomeFloatingAi from "@/components/ai/HomeFloatingAi";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Diggaj Realty",
  url: "https://diggajrealty.com",
  description:
    "All-in-one resale property platform with verified listings and a dedicated advisor to help you buy or sell.",
  areaServed: "IN",
};

// Page narrative: what it is (Hero) → why it exists (ValueProp) →
// who it's for (BuySell) → the homes themselves (Showcase + Listings + Popular) →
// where (ExploreMap) → by project → objections (Faq) → ask (LeadSection) →
// close (Footer CTA).
//
// LeadSection sits after Faq on purpose: the objections are answered by the
// time the form is put in front of anyone, and it gives the sticky bar an
// on-page target so the CTA doesn't have to bounce the visitor to /contact.
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
      <LeadSection
        title="Tell us what you're looking for"
        lead="Budget, locality, timeline — send it over and an advisor will come back with a shortlist that actually fits."
        subject="Home page enquiry"
        source="home-inline"
        cta="Get my shortlist"
      />
      <Footer />
      <HomeFloatingAi />
      <StickyLeadBar
        label="Looking for a home in Bangalore?"
        cta="Talk to an advisor"
        storageKey="home-sticky-lead-dismissed"
      />
    </main>
  );
}
