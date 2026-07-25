"use client";

import { RowSkeleton } from "@/components/Skeleton";

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function Panel({
  loading,
  error,
  empty,
  emptyText,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  if (loading)
    return (
      <div className="flex flex-col gap-3">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    );
  if (error) return <p className="py-8 text-sm text-red-700">{error}</p>;
  if (empty)
    return <p className="rounded-2xl bg-white p-6 text-sm text-body ring-1 ring-ink/5">{emptyText}</p>;
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function Step({ done, label, detail }: { done: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
          done ? "bg-lime text-ink" : "bg-ink/10 text-ink/40"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <div>
        <p className={`text-sm ${done ? "text-ink" : "text-ink/50"}`}>{label}</p>
        {detail && <p className="text-xs text-body">{detail}</p>}
      </div>
    </div>
  );
}
