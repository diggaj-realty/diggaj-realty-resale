"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getOffer } from "@/lib/api/buyer";
import { price } from "@/lib/listings";
import { RowSkeleton } from "@/components/Skeleton";
import type { OfferEvent, OfferEventType } from "@/types/buyer";

const EVENT_LABEL: Record<OfferEventType, string> = {
  CREATED: "Offer submitted",
  FORWARDED: "Forwarded to seller",
  COUNTERED_BACKEND: "Countered",
  COUNTERED_SELLER: "Seller countered",
  COUNTERED_BUYER: "Buyer countered",
  ACCEPTED: "Offer accepted",
  REJECTED: "Offer rejected",
  COUNTER_ACCEPTED: "Counter accepted",
  COUNTER_REJECTED: "Counter rejected",
  CLOSED: "Negotiation closed",
};

const ACTOR_LABEL: Record<OfferEvent["actorRole"], string> = {
  BUYER: "Buyer",
  SELLER: "Seller",
  BACKEND: "Diggaj team",
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Full negotiation history for one offer — same component/shape for both
 *  the buyer and seller view, since `GET /offers/:id` returns identical
 *  events on both sides.
 *
 *  Pass `events` directly when the caller already has them (e.g. the
 *  transaction detail page's single aggregate fetch already includes
 *  `acceptedOffer.events`) to skip a redundant `GET /offers/:id` round trip;
 *  otherwise pass `offerId` and this fetches them itself (e.g. OfferCard,
 *  which only ever has the bare offer). */
export default function OfferTimeline({ offerId, events: providedEvents }: { offerId?: string; events?: OfferEvent[] }) {
  const { token } = useAuth();
  const [fetchedEvents, setFetchedEvents] = useState<OfferEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providedEvents || !token || !offerId) return;
    getOffer(token, offerId)
      .then((o) => setFetchedEvents(o.events))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load history"));
  }, [token, offerId, providedEvents]);

  const events = providedEvents ?? fetchedEvents;

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (events === null) return <RowSkeleton />;
  if (events.length === 0) return <p className="text-sm text-body">No history yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {events.map((e) => (
        <div key={e.id} className="flex items-start gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
          <div className="min-w-0">
            <p className="text-sm text-ink">
              {EVENT_LABEL[e.type]}
              {e.amount != null && <span className="text-body"> — {price(e.amount)}</span>}
            </p>
            <p className="text-xs text-body">
              {ACTOR_LABEL[e.actorRole]} · {fmtDateTime(e.createdAt)}
            </p>
            {e.note && <p className="mt-0.5 text-xs text-ink/70">“{e.note}”</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
