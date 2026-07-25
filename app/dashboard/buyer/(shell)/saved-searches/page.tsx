import { SearchesPanel } from "@/components/dashboard/buyer/panels";

export default function SavedSearchesPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Saved searches</h1>
      <p className="mt-1 text-sm text-body">Get alerted the moment a new listing matches your criteria.</p>
      <div className="mt-6">
        <SearchesPanel />
      </div>
    </div>
  );
}
