"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateProfile, changePassword } from "@/lib/api/profile";
import { addRole } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { UserRole } from "@/types/auth";

const field = "rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30";

/** Account settings — mounted inside DashboardShell (buyer or seller), so it
 *  relies on the shell for the auth guard/loading state rather than
 *  duplicating one; `user` is guaranteed to be present by the time this
 *  renders. */
export default function ProfileSettings() {
  const { user, token, setSession } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  // Seed the editable fields from `user` the moment it becomes available —
  // done during render (not an effect) per react.dev's "adjusting state when
  // a prop changes", so there's no extra render/flash of empty inputs.
  const [seededFor, setSeededFor] = useState<string | null>(user?.id ?? null);
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

  const [addingRole, setAddingRole] = useState(false);
  const [addRoleError, setAddRoleError] = useState<string | null>(null);

  if (!user) return null;

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

  async function handleAddRole(newRole: UserRole) {
    if (!token) return;
    setAddingRole(true);
    setAddRoleError(null);
    try {
      const updated = await addRole(token, newRole);
      setSession(token, updated);
    } catch (err) {
      setAddRoleError(err instanceof ApiError ? err.message : "Failed to add role");
    } finally {
      setAddingRole(false);
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

  const heldRoles = user.roles?.length ? user.roles : [user.role];

  return (
    <div className="flex max-w-xl flex-col gap-8">
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
            <p className="text-xs text-body">Email can&apos;t be changed here. Contact support if needed.</p>
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-ink">
            Account type
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ink/5 px-4 py-3">
              {heldRoles.map((r) => (
                <span key={r} className="rounded-full bg-panel px-3 py-1 text-xs font-medium text-white">
                  {r === "BUYER" ? "Buyer" : "Seller"}
                </span>
              ))}
              {(["BUYER", "SELLER"] as const)
                .filter((r) => !heldRoles.includes(r))
                .map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleAddRole(r)}
                    disabled={addingRole}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink/70 ring-1 ring-ink/10 hover:bg-ink/5 disabled:opacity-50"
                  >
                    {addingRole ? "Adding…" : `+ Add ${r === "BUYER" ? "buyer" : "seller"} access`}
                  </button>
                ))}
            </div>
            {addRoleError && <p className="text-xs text-red-700">{addRoleError}</p>}
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
  );
}
