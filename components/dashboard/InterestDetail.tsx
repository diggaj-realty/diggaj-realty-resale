"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { propertyHref } from "@/lib/slug";
import { getInterest, cancelInterest } from "@/lib/api/interests";
import { getNegotiationSessions, getNegotiationSession } from "@/lib/api/negotiationSessions";
import { useCachedPanelData } from "@/lib/dashboard/useCachedPanelData";
import { Panel, fmtDate } from "@/components/dashboard/shared";
import { formatPhone, telHref } from "@/lib/phone";
import StatusBadge from "@/components/dashboard/StatusBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import NegotiationSessionView from "@/components/dashboard/NegotiationSessionView";
import { TERMINAL_INTEREST_STATUSES } from "@/types/transaction";
import type { PropertyInterestDetail, NegotiationSession } from "@/types/transaction";
import type { UserRole } from "@/types/auth";

export default function InterestDetail({ interestId, viewerRole }: { interestId: string; viewerRole: UserRole }) {
  const { user, token } = useAuth();
  const cacheKey = token ? `interest:${interestId}:${token}` : null;
  const { items: interest, error, load } = useCachedPanelData<PropertyInterestDetail>(cacheKey, () =>
    getInterest(token!, interestId)
  );

  // Gated on `interest` having loaded first — this session lookup needs the
  // property id off it, so its own cache key stays null (and its effect
  // skips) until then.
  const sessionCacheKey = token && interest ? `interest-session:${interest.id}:${token}` : null;
  const { items: session, load: loadSession } = useCachedPanelData<NegotiationSession | null>(
    sessionCacheKey,
    async () => {
      if (!token || !interest) return null;
      const { items } = await getNegotiationSessions(token, { propertyId: interest.propertyId });
      const match = items.find((s) => s.interestId === interest.id) ?? items[0];
      if (!match) return null;
      return getNegotiationSession(token, match.id);
    }
  );

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function withdraw() {
    if (!token || !interest) return;
    if (!window.confirm("Withdraw your interest in this property? This can't be undone.")) return;
    setBusy(true);
    setActionError(null);
    try {
      await cancelInterest(token, interest.id);
      load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to withdraw");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel loading={interest === null && !error} error={error} empty={false} emptyText="">
      {interest && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={propertyHref({ id: interest.propertyId, title: interest.propertyTitle ?? "Property" })}
                  className="block truncate text-lg font-medium text-ink hover:underline"
                >
                  {interest.propertyTitle ?? "Property"}
                </Link>
                <p className="truncate text-sm text-body">{interest.propertyLocation}</p>
              </div>
              <StatusBadge status={interest.status} />
            </div>
            {interest.buyerNote && (
              <p className="mt-3 rounded-xl bg-cream px-3 py-2.5 text-xs text-ink/70">
                Note: &ldquo;{interest.buyerNote}&rdquo;
              </p>
            )}
          </div>

          {interest.status === "CONVERTED_TO_DEAL" && (
            <div className="rounded-2xl bg-limepale p-5">
              <p className="text-sm font-medium text-ink">This lead became a deal</p>
              <p className="mt-1 text-xs text-ink/70">
                Track payments, documents, and closing from your deals list.
              </p>
              {/* Buyers have no /deals list route — their equivalent surface is
                  Closing & Documents. This link used to 404 for every buyer
                  whose interest converted to a deal. */}
              <Link
                href={
                  viewerRole === "BUYER"
                    ? "/dashboard/buyer/closing"
                    : "/dashboard/seller/deals"
                }
                className="mt-3 inline-block rounded-full bg-panel px-5 py-2.5 text-xs font-medium text-white"
              >
                View your deals →
              </Link>
            </div>
          )}

          <section>
            <h2 className="mb-3 text-sm font-medium text-ink">Assigned advisor</h2>
            {interest.agentName ? (
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{interest.agentName}</p>
                  {interest.agentPhone && (
                    <a href={telHref(interest.agentPhone)} className="text-xs text-body underline underline-offset-2">
                      {formatPhone(interest.agentPhone)}
                    </a>
                  )}
                </div>
                <WhatsAppButton
                  message={`Hi, I'm reaching out about ${interest.propertyTitle ?? "a property"} on Diggaj Realty.`}
                />
              </div>
            ) : (
              <p className="text-sm text-body">No advisor assigned yet. One will be assigned shortly.</p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium text-ink">Site visits</h2>
            {interest.siteVisits.length === 0 ? (
              <p className="text-sm text-body">No site visit requested yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {interest.siteVisits.map((v) => (
                  <div key={v.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-ink">Requested for {fmtDate(v.requestedDate)}</p>
                      <StatusBadge status={v.status} />
                    </div>
                    {v.scheduledDate && (
                      <p className="mt-1 text-xs text-body">Scheduled for {fmtDate(v.scheduledDate)}</p>
                    )}
                    {v.outcome && (
                      <p className="mt-1 text-xs text-body">
                        Outcome: {v.outcome === "INTERESTED" ? "Interested" : "Not interested"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {session && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-ink">Negotiation</h2>
              <NegotiationSessionView session={session} viewerId={user?.id} onChanged={loadSession} />
            </section>
          )}

          {viewerRole === "BUYER" && !TERMINAL_INTEREST_STATUSES.includes(interest.status) && (
            <div className="rounded-2xl bg-ink/5 px-5 py-4">
              <button
                onClick={withdraw}
                disabled={busy}
                className="text-xs font-medium text-red-700 underline underline-offset-2 disabled:opacity-50"
              >
                {busy ? "Withdrawing…" : "Withdraw interest"}
              </button>
              {actionError && <p className="mt-2 text-xs text-red-700">{actionError}</p>}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
