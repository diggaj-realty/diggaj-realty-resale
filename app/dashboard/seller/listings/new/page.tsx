import NewListingPageClient from "@/components/seller/listing-form/NewListingPageClient";

export default function NewListingPage() {
  return <NewListingPageClient mapsApiKey={process.env.GOOGLE_PLACES_API_KEY} />;
}
