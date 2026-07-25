"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateProfile, changePassword } from "@/lib/api/profile";
import { ApiError } from "@/lib/api/client";

export default function ProfilePage() {
  const { user, token, loading, setSession } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // Seed the editable fields from `user` the moment it becomes available —
  // done during render (not an effect) per react.dev's "adjusting state when
  // a prop changes", so there's no extra render/flash of empty inputs.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (user && seededFor !== user.id) {
    setSeededFor(user.id);
    setName(user.name);
    setPhone(user.phone ?? "");
  }
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user, router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const updated = await updateProfile(token, { name: name.trim(), phone: phone.trim() || undefined });
      setSession(token, updated);
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordChanged(false);
    try {
      await changePassword(token, { currentPassword, newPassword });
      setPasswordChanged(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-white">
        <Nav />
        <p className="px-8 py-16 text-sm text-body md:px-14">Loading…</p>
      </main>
    );
  }

  const field =
    "rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30";

  return (
    <main className="min-h-screen overflow-x-clip bg-white">
      <div className="bg-cream pb-10">
        <Nav />
        <div className="px-8 pt-10 md:px-14">
          <h1 className="text-4xl font-medium tracking-[-0.02em] text-ink md:text-5xl">Profile &amp; Settings</h1>
          <p className="mt-2 text-sm text-body">Manage your account details.</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-8 px-8 py-10 md:px-14">
        {/* profile */}
        <form onSubmit={saveProfile} className="rounded-2xl bg-white p-6 ring-1 ring-ink/5">
          <p className="text-sm font-medium text-ink">Your details</p>
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Full name
              <input value={name} onChange={(e) => setName(e.target.value)} className={field} required />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Phone <span className="font-normal text-body">(optional)</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="98765 43210" />
            </label>
            <div className="flex flex-col gap-1.5 text-sm text-ink">
              Email
              <p className="rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink/50">{user.email}</p>
              <p className="text-xs text-body">Email can&apos;t be changed here — contact support if needed.</p>
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-ink">
              Account type
              <p className="rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink/50">
                {user.role === "BUYER" ? "Buyer" : "Seller"}
              </p>
            </div>
          </div>
          {profileError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</p>}
          {profileSaved && <p className="mt-4 rounded-xl bg-limepale px-4 py-3 text-sm text-ink">✓ Profile updated</p>}
          <button
            type="submit"
            disabled={savingProfile}
            className="mt-5 rounded-full bg-panel px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>

        {/* password */}
        <form onSubmit={savePassword} className="rounded-2xl bg-white p-6 ring-1 ring-ink/5">
          <p className="text-sm font-medium text-ink">Change password</p>
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={field}
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              New password
              <input
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={field}
                required
              />
            </label>
          </div>
          {passwordError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</p>}
          {passwordChanged && <p className="mt-4 rounded-xl bg-limepale px-4 py-3 text-sm text-ink">✓ Password changed</p>}
          <button
            type="submit"
            disabled={changingPassword}
            className="mt-5 rounded-full bg-panel px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {changingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
