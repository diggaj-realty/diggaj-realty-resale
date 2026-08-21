const TONE: Record<string, string> = {
  green: "bg-limepale text-ink ring-lime/40",
  gold: "bg-amber-100 text-amber-900 ring-amber-200",
  blue: "bg-sky-100 text-sky-900 ring-sky-200",
  red: "bg-red-100 text-red-900 ring-red-200",
  gray: "bg-ink/5 text-ink/70 ring-ink/10",
};

/** Maps a raw status string to a tone + human label. */
const MAP: Record<string, { tone: keyof typeof TONE; label: string }> = {
  // properties — PENDING_VERIFICATION and LIVE were missing, so the seller's
  // "My Listings" page rendered the raw enum text for every listing.
  // (DRAFT is already mapped further down with the document statuses.)
  PENDING_VERIFICATION: { tone: "gold", label: "Under review" },
  LIVE: { tone: "green", label: "Live" },
  UNDER_CONTRACT: { tone: "blue", label: "Sale in progress" },
  // offers
  PENDING: { tone: "gold", label: "Pending" },
  PENDING_REVIEW: { tone: "gold", label: "Pending" },
  COUNTERED: { tone: "blue", label: "Countered" },
  ACCEPTED: { tone: "green", label: "Accepted" },
  REJECTED: { tone: "red", label: "Rejected" },
  NEGOTIATION_CLOSED: { tone: "gray", label: "Negotiation closed" },
  // site visits
  REQUESTED: { tone: "gold", label: "Requested" },
  SCHEDULED: { tone: "blue", label: "Scheduled" },
  COMPLETED: { tone: "green", label: "Completed" },
  CANCELLED: { tone: "gray", label: "Cancelled" },
  // deals
  IN_PROGRESS: { tone: "blue", label: "In progress" },
  CLOSED: { tone: "green", label: "Closed" },
  // payment requests (PENDING/CANCELLED already covered above)
  PAYMENT_INITIATED: { tone: "blue", label: "Payment initiated" },
  PAID: { tone: "green", label: "Paid" },
  FAILED: { tone: "red", label: "Failed" },
  // property interests (CLOSED/CANCELLED already covered above)
  NEW: { tone: "gold", label: "New" },
  CONTACT_REQUESTED: { tone: "gold", label: "Contact requested" },
  AGENT_ASSIGNED: { tone: "blue", label: "Advisor assigned" },
  CONTACT_IN_PROGRESS: { tone: "blue", label: "Contact in progress" },
  SITE_VISIT_REQUESTED: { tone: "gold", label: "Visit requested" },
  SITE_VISIT_SCHEDULED: { tone: "blue", label: "Visit scheduled" },
  SITE_VISIT_COMPLETED: { tone: "blue", label: "Visit completed" },
  INTERESTED: { tone: "green", label: "Interested" },
  NOT_INTERESTED: { tone: "gray", label: "Not interested" },
  NEGOTIATION_IN_PROGRESS: { tone: "blue", label: "Negotiating" },
  CONVERTED_TO_DEAL: { tone: "green", label: "Deal created" },
  // document requests (REJECTED/COMPLETED/CANCELLED already covered above)
  PENDING_AGENT_REVIEW: { tone: "gold", label: "Awaiting advisor review" },
  FORWARDED_TO_OWNER: { tone: "blue", label: "Forwarded for upload" },
  EXISTING_DOCUMENT_SHARED: { tone: "green", label: "Shared" },
  OWNER_UPLOADED: { tone: "blue", label: "Uploaded" },
  APPROVED: { tone: "green", label: "Approved" },
  // identity verification / signatures (PENDING/FAILED already covered above)
  INITIATED: { tone: "blue", label: "Initiated" },
  VERIFIED: { tone: "green", label: "Verified" },
  EXPIRED: { tone: "gray", label: "Expired" },
  SIGNED: { tone: "green", label: "Signed" },
  // agreements
  DRAFT: { tone: "gray", label: "Draft" },
  READY_FOR_SIGNATURE: { tone: "gold", label: "Ready to sign" },
  SIGNING_IN_PROGRESS: { tone: "blue", label: "Signing in progress" },
  PARTIALLY_SIGNED: { tone: "blue", label: "Partially signed" },
  FULLY_EXECUTED: { tone: "green", label: "Fully executed" },
  // negotiation sessions (FAILED/CANCELLED already covered above)
  OPEN: { tone: "blue", label: "Open" },
  AGREEMENT_PENDING_CONFIRMATION: { tone: "gold", label: "Awaiting confirmation" },
  AGREED: { tone: "green", label: "Agreed" },
};

/** The same human label the badge shows, for callers that need the text on its
 *  own — chart axes, for one, which would otherwise print raw enum names. */
export function statusLabel(status: string): string {
  return MAP[status]?.label ?? status;
}

export default function StatusBadge({ status }: { status: string }) {
  const entry = MAP[status] ?? { tone: "gray" as const, label: status };
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${TONE[entry.tone]}`}>
      {entry.label}
    </span>
  );
}
