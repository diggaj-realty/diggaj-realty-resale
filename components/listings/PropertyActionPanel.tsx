"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { getInterests } from "@/lib/api/interests";
import { TERMINAL_INTEREST_STATUSES } from "@/types/transaction";
import type { PropertyInterest } from "@/types/transaction";
import type { Property } from "@/types/api";
import ExpressInterestButton from "@/components/listings/ExpressInterestButton";
import MakeOfferModal from "@/components/listings/MakeOfferModal";
import StatusBadge from "@/components/dashboard/StatusBadge";

/** The property page's next-action area — state-aware rather than showing
 *  every possible action to every visitor:
 *  - the property's own seller → manage the listing, not buyer actions
 *  - an under-contract property → badge, no new-transaction actions
 *  - a buyer with an active (non-terminal) interest already → their status
 *    and a link into it, not the raw action forms again
 *  - otherwise → Show Interest (primary, low-friction) with Make an Offer
 *    as a secondary online-negotiation path
 *  There is no separate save action: Show Interest shortlists the property as
 *  part of creating the lead (see ExpressInterestButton), so enquiring about a
 *  home always saves it too. */
export default function PropertyActionPanel({ property }: { property: Property }) {
  const { user, token } = useAuth();
  const isBuyer = hasRole(user, "BUYER");
  const isSeller = hasRole(user, "SELLER");
  const isOwnProperty = isSeller && !!user && property.sellerId === user.id;

  const [interest, setInterest] = useState<PropertyInterest | null>(null);
  // ExpressInterestButton can resume a just-expressed interest (from a login
  // redirect) via `onExpressed` below, on the very same mount as this
  // hydrate fetch. If that fetch was in flight *before* the resumed POST
  // created the interest, its response reflects the pre-POST state and would
  // otherwise stomp the correct, more recent value with `null`.
  const resumedRef = useRef(false);

  useEffect(() => {
    if (!isBuyer || !token) return;
    getInterests(token, { propertyId: property.id })
      .then((r) => {
        if (resumedRef.current) return;
        setInterest(r.items[0] ?? null);
      })
      .catch(() => {
        if (!resumedRef.current) setInterest(null);
      });
  }, [isBuyer, token, property.id]);

  function handleExpressed(next: PropertyInterest) {
    resumedRef.current = true;
    setInterest(next);
  }

  const underContract = property.status === "UNDER_CONTRACT";
  const activeInterest =
    interest && !TERMINAL_INTEREST_STATUSES.includes(interest.status) ? interest : null;

  if (isOwnProperty) {
    return (
      <div className="mt-5 flex flex-col gap-2.5">
        <Link
          href="/dashboard/seller/listings"
          className="w-full rounded-full bg-panel px-6 py-3.5 text-center text-sm font-medium text-white transition-transform hover:-translate-y-px"
        >
          Manage this listing →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-col gap-2.5">
      {underContract && (
        <p className="rounded-xl bg-ink/5 px-4 py-2.5 text-xs text-ink/70">
          This property is under contract with another buyer; new offers and interest requests
          aren&apos;t open right now.
        </p>
      )}

      {activeInterest ? (
        <>
          <Link
            href={`/dashboard/buyer/interests/${activeInterest.id}`}
            className="w-full rounded-full bg-lime px-6 py-3.5 text-center text-sm font-semibold text-ink transition-transform hover:-translate-y-px"
          >
            View your interest →
          </Link>
          <div className="flex justify-center">
            <StatusBadge status={activeInterest.status} />
          </div>
        </>
      ) : (
        !underContract && (
          // One line: the wide offer button plus the icon-only interest/save
          // heart. Stacking two full-width pills made this block twice as tall
          // as it needed to be.
          <div className="flex items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <MakeOfferModal propertyId={property.id} askingPrice={property.askingPrice} />
            </div>
            <ExpressInterestButton propertyId={property.id} onExpressed={handleExpressed} />
          </div>
        )
      )}

    </div>
  );
}
