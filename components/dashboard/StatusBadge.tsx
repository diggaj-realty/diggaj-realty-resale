const TONE: Record<string, string> = {
  green: "bg-limepale text-ink ring-lime/40",
  gold: "bg-amber-100 text-amber-900 ring-amber-200",
  blue: "bg-sky-100 text-sky-900 ring-sky-200",
  red: "bg-red-100 text-red-900 ring-red-200",
  gray: "bg-ink/5 text-ink/70 ring-ink/10",
};

/** Maps a raw status string to a tone + human label. */
const MAP: Record<string, { tone: keyof typeof TONE; label: string }> = {
  // offers
  PENDING: { tone: "gold", label: "Pending" },
  PENDING_REVIEW: { tone: "gold", label: "Pending" },
  COUNTERED: { tone: "blue", label: "Countered" },
  ACCEPTED: { tone: "green", label: "Accepted" },
  REJECTED: { tone: "red", label: "Rejected" },
  // site visits
  REQUESTED: { tone: "gold", label: "Requested" },
  SCHEDULED: { tone: "blue", label: "Scheduled" },
  COMPLETED: { tone: "green", label: "Completed" },
  CANCELLED: { tone: "gray", label: "Cancelled" },
  // deals
  IN_PROGRESS: { tone: "blue", label: "In progress" },
  CLOSED: { tone: "green", label: "Closed" },
};

export default function StatusBadge({ status }: { status: string }) {
  const entry = MAP[status] ?? { tone: "gray" as const, label: status };
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${TONE[entry.tone]}`}>
      {entry.label}
    </span>
  );
}
