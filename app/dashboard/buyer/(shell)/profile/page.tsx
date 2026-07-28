import ProfileSettings from "@/components/dashboard/ProfileSettings";

export default function BuyerProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Profile &amp; Settings</h1>
      <p className="mt-1 text-sm text-body">Manage your account details.</p>
      <div className="mt-6">
        <ProfileSettings />
      </div>
    </div>
  );
}
