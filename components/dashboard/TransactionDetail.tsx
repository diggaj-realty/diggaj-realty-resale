"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { propertyHref } from "@/lib/slug";
import StatusBadge from "@/components/dashboard/StatusBadge";
import OfferTimeline from "@/components/dashboard/OfferTimeline";
import DealDocuments from "@/components/dashboard/DealDocuments";
import PaymentRequests from "@/components/dashboard/PaymentRequests";
import TransactionTimeline from "@/components/dashboard/TransactionTimeline";
import AgreedAmountSummary from "@/components/dashboard/AgreedAmountSummary";
import SiteVisitSummary from "@/components/dashboard/SiteVisitSummary";
import OfflineNegotiationList from "@/components/dashboard/OfflineNegotiationList";
import { Panel, fmtDate } from "@/components/dashboard/shared";
import { useCachedPanelData } from "@/lib/dashboard/useCachedPanelData";
import { getTransactionDetail } from "@/lib/api/buyer";
import type { TransactionDetail as TransactionDetailData, TransactionParty } from "@/types/buyer";
import type { UserRole } from "@/types/auth";

function PartyCard({ role, party }: { role: string; party: TransactionParty | null }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <p className="text-[11px] text-body">{role}</p>
      {party ? (
        <>
          <p className="mt-1 text-sm font-medium text-ink">{party.name}</p>
          {party.phone && <p className="text-xs text-body">{party.phone}</p>}
          {party.email && <p className="truncate text-xs text-body">{party.email}</p>}
        </>
      ) : (
        <p className="mt-1 text-sm text-ink/40">Not yet assigned</p>
      )}
    </div>
  );
}

function TransactionBody({ data, viewerRole, onChanged }: { data: TransactionDetailData; viewerRole: UserRole; onChanged: () => void }) {
  const cover = data.property.photos?.[0]?.url;

  return (
    <div className="flex flex-col gap-6">
      {/* Property header */}
      <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <Link href={propertyHref(data.property)} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-cream">
          {cover && <Image src={cover} alt={data.property.title} fill sizes="112px" className="object-cover" />}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={propertyHref(data.property)} className="block truncate text-lg font-medium text-ink hover:underline">
            {data.property.title}
          </Link>
          <p className="truncate text-sm text-body">{data.property.location}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={data.property.status} />
            <StatusBadge status={data.deal.status} />
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PartyCard role="Buyer" party={data.buyer} />
        <PartyCard role="Seller" party={data.seller} />
        <PartyCard role="Assigned agent" party={data.agent} />
      </div>

      {/* Transaction stage */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <p className="mb-4 text-sm font-medium text-ink">Transaction progress</p>
        <TransactionTimeline stage={data.stage} stageLabel={data.stageLabel} />
      </div>

      {/* Amounts */}
      <AgreedAmountSummary acceptedOffer={data.acceptedOffer} deal={data.deal} offlineNegotiations={data.offlineNegotiations} />

      {/* Accepted offer / negotiation history */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Offer &amp; negotiation history</h2>
        {data.acceptedOffer ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <OfferTimeline events={data.acceptedOffer.events} />
          </div>
        ) : (
          <p className="text-sm text-body">This deal was agreed in person during a site visit — there&apos;s no online offer history.</p>
        )}
      </section>

      {/* Site visit */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Site visit</h2>
        <SiteVisitSummary siteVisit={data.siteVisit} />
      </section>

      {/* Offline negotiation */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Offline negotiation</h2>
        <OfflineNegotiationList records={data.offlineNegotiations} />
      </section>

      {/* Documents */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">
          Documents {data.documentProgress.total > 0 && (
            <span className="font-normal text-body">
              ({data.documentProgress.approved}/{data.documentProgress.total} approved)
            </span>
          )}
        </h2>
        <DealDocuments dealId={data.dealId} viewerRole={viewerRole} initialDocuments={data.documents} onChanged={onChanged} />
      </section>

      {/* Payments */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">
          Payments {data.paymentProgress.total > 0 && (
            <span className="font-normal text-body">
              ({data.paymentProgress.paid}/{data.paymentProgress.total} paid)
            </span>
          )}
        </h2>
        <PaymentRequests requests={data.paymentRequests} viewerRole={viewerRole} dealId={data.dealId} onChanged={onChanged} />
      </section>

      {/* Coordinator updates */}
      {data.logEntries.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-ink">Updates from your coordinator</h2>
          <div className="flex flex-col gap-2">
            {data.logEntries.map((e) => (
              <div key={e.id} className="rounded-xl bg-cream px-4 py-3 text-xs text-ink/70">
                <p>{e.message}</p>
                <p className="mt-1 text-ink/40">{fmtDate(e.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-2xl bg-ink/5 px-5 py-4 text-xs text-body">
        Questions about your transaction?{" "}
        <Link href="/contact" className="font-medium text-ink underline underline-offset-2">
          Contact your Diggaj coordinator →
        </Link>
      </div>
    </div>
  );
}

export default function TransactionDetail({ dealId, viewerRole }: { dealId: string; viewerRole: UserRole }) {
  const { token } = useAuth();
  const cacheKey = token ? `transaction:${dealId}:${token}` : null;
  const { items, error, load } = useCachedPanelData<TransactionDetailData>(cacheKey, () =>
    getTransactionDetail(token!, dealId)
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={load}
          className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10"
        >
          Refresh →
        </button>
      </div>
      <Panel loading={items === null && !error} error={error} empty={false} emptyText="">
        {items && <TransactionBody data={items} viewerRole={viewerRole} onChanged={load} />}
      </Panel>
    </div>
  );
}
