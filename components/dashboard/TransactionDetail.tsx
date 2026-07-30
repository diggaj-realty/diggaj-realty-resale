"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { propertyHref } from "@/lib/slug";
import StatusBadge from "@/components/dashboard/StatusBadge";
import OfferTimeline from "@/components/dashboard/OfferTimeline";
import DealDocuments from "@/components/dashboard/DealDocuments";
import PaymentRequests from "@/components/dashboard/PaymentRequests";
import DealProgress from "@/components/dashboard/DealProgress";
import AgreedAmountSummary from "@/components/dashboard/AgreedAmountSummary";
import SiteVisitSummary from "@/components/dashboard/SiteVisitSummary";
import OfflineNegotiationList from "@/components/dashboard/OfflineNegotiationList";
import CostSheet from "@/components/dashboard/CostSheet";
import DocumentRequestPanel from "@/components/dashboard/DocumentRequestPanel";
import IdentityVerificationPanel from "@/components/dashboard/IdentityVerificationPanel";
import AgreementPanel from "@/components/dashboard/AgreementPanel";
import ClosureChecklistView from "@/components/dashboard/ClosureChecklistView";
import { Panel, fmtDate } from "@/components/dashboard/shared";
import { formatPhone, telHref } from "@/lib/phone";
import { useCachedPanelData } from "@/lib/dashboard/useCachedPanelData";
import {
  getTransactionDetail,
  getOfflineNegotiations,
  getCostSheet,
  getDealProgress,
} from "@/lib/api/buyer";
import { getDocumentRequests } from "@/lib/api/documentRequests";
import { getIdentityVerification, getAgreements } from "@/lib/api/dealCompliance";
import { deriveClosureChecklist } from "@/lib/dashboard/deriveClosureChecklist";
import type { TransactionDetail as TransactionDetailData, TransactionParty } from "@/types/buyer";
import type {
  DocumentRequest,
  IdentityVerificationSummary,
  DealAgreement,
  OfflineNegotiationRecord,
  CostSheet as CostSheetData,
  DealProgress as DealProgressData,
} from "@/types/transaction";
import type { UserRole } from "@/types/auth";

function PartyCard({ role, party }: { role: string; party: TransactionParty | null }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <p className="text-[11px] text-body">{role}</p>
      {party ? (
        <>
          <p className="mt-1 text-sm font-medium text-ink">{party.name}</p>
          {party.phone && (
            <a href={telHref(party.phone)} className="text-xs text-body underline underline-offset-2">
              {formatPhone(party.phone)}
            </a>
          )}
          {party.email && <p className="truncate text-xs text-body">{party.email}</p>}
        </>
      ) : (
        <p className="mt-1 text-sm text-ink/40">Not yet assigned</p>
      )}
    </div>
  );
}

function TransactionBody({
  data,
  viewerRole,
  viewerId,
  documentRequests,
  identity,
  agreements,
  offlineNegotiations,
  costSheet,
  progress,
  onChanged,
  onDocumentRequestsChanged,
  onIdentityChanged,
  onAgreementsChanged,
  onOfflineNegotiationsChanged,
  onCostSheetChanged,
}: {
  data: TransactionDetailData;
  viewerRole: UserRole;
  viewerId: string | undefined;
  documentRequests: DocumentRequest[] | null;
  identity: IdentityVerificationSummary | null;
  agreements: DealAgreement[] | null;
  offlineNegotiations: OfflineNegotiationRecord[] | null;
  /** Wrapped so "hasn't loaded yet" (`null`) is distinguishable from "loaded,
   *  no sheet sent yet" (`{ sheet: null }`) — the endpoint's own empty result
   *  is `null` too, which the cache hook can't otherwise tell apart. */
  costSheet: { sheet: CostSheetData | null } | null;
  progress: DealProgressData | null;
  onChanged: () => void;
  onDocumentRequestsChanged: () => void;
  onIdentityChanged: () => void;
  onAgreementsChanged: () => void;
  onOfflineNegotiationsChanged: () => void;
  onCostSheetChanged: () => void;
}) {
  const cover = data.property.photos?.[0]?.url;
  const latestAgreement = agreements?.[0] ?? null;

  const checklist = deriveClosureChecklist({
    deal: data.deal,
    documentProgress: data.documentProgress,
    identity,
    latestAgreement,
    paymentProgress: data.paymentProgress,
  });

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
        {progress ? (
          <DealProgress progress={progress} />
        ) : (
          <p className="text-sm text-body">Loading…</p>
        )}
      </div>

      {/* Amounts */}
      <AgreedAmountSummary
        acceptedOffer={data.acceptedOffer}
        deal={data.deal}
        offlineNegotiations={offlineNegotiations ?? []}
      />

      {/* Accepted offer / negotiation history */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Offer &amp; negotiation history</h2>
        {data.acceptedOffer ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <OfferTimeline events={data.acceptedOffer.events} />
          </div>
        ) : (
          <p className="text-sm text-body">This deal was agreed in person during a site visit. There&apos;s no online offer history.</p>
        )}
      </section>

      {/* Site visit */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Site visit</h2>
        <SiteVisitSummary siteVisit={data.siteVisit} />
      </section>

      {/* Offline negotiation — the recorded price, confirmed or disputed by
          both parties themselves; staff cannot confirm on their behalf. */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Recorded price</h2>
        {offlineNegotiations === null ? (
          <p className="text-sm text-body">Loading…</p>
        ) : (
          <OfflineNegotiationList
            dealId={data.dealId}
            records={offlineNegotiations}
            buyerId={data.buyer.id}
            sellerId={data.seller.id}
            viewerId={viewerId}
            onChanged={onOfflineNegotiationsChanged}
          />
        )}
      </section>

      {/* Cost sheet — buyer-only; sellers get nothing back from the endpoint. */}
      {viewerRole === "BUYER" && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-ink">Cost breakdown</h2>
          {costSheet === null ? (
            <p className="text-sm text-body">Loading…</p>
          ) : costSheet.sheet ? (
            <CostSheet dealId={data.dealId} sheet={costSheet.sheet} onChanged={onCostSheetChanged} />
          ) : (
            <p className="text-sm text-body">No cost sheet has been sent to you yet.</p>
          )}
        </section>
      )}

      {/* Documents */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">
          Documents {data.documentProgress.total > 0 && (
            <span className="font-normal text-body">
              ({data.documentProgress.approved}/{data.documentProgress.total} approved)
            </span>
          )}
        </h2>
        {/* Deliberately NOT passing data.documents here: the aggregate
            endpoint's copy doesn't apply the ownership/access-grant
            filtering that GET /deals/:id/documents does, so it can expose a
            counterparty's private fileUrl. Letting DealDocuments fetch for
            itself uses the endpoint that actually enforces canView. */}
        <DealDocuments dealId={data.dealId} viewerRole={viewerRole} onChanged={onChanged} />
      </section>

      {/* Cross-party document requests */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Document requests</h2>
        {documentRequests === null ? (
          <p className="text-sm text-body">Loading…</p>
        ) : (
          <DocumentRequestPanel
            dealId={data.dealId}
            viewerRole={viewerRole}
            viewerId={viewerId}
            requests={documentRequests}
            onChanged={onDocumentRequestsChanged}
          />
        )}
      </section>

      {/* Identity verification */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Identity verification</h2>
        {identity ? (
          <IdentityVerificationPanel
            dealId={data.dealId}
            summary={identity}
            viewerId={viewerId}
            buyerId={data.buyer.id}
            sellerId={data.seller.id}
            onChanged={onIdentityChanged}
          />
        ) : (
          <p className="text-sm text-body">Loading…</p>
        )}
      </section>

      {/* Agreement + signatures */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Agreement</h2>
        {latestAgreement ? (
          <>
            <AgreementPanel
              dealId={data.dealId}
              agreement={latestAgreement}
              viewerId={viewerId}
              onChanged={onAgreementsChanged}
            />
            {agreements && agreements.length > 1 && (
              <p className="mt-2 text-[11px] text-ink/40">
                {agreements.length - 1} earlier version(s) superseded; only the current version above is signable.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-body">No agreement generated yet.</p>
        )}
      </section>

      {/* Closure checklist */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Closure</h2>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
          <ClosureChecklistView checklist={checklist} dealStatus={data.deal.status} />
        </div>
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
  const { user, token } = useAuth();
  const cacheKey = token ? `transaction:${dealId}:${token}` : null;
  const { items, error, load } = useCachedPanelData<TransactionDetailData>(cacheKey, () =>
    getTransactionDetail(token!, dealId)
  );

  const requestsCacheKey = token ? `deal-doc-requests:${dealId}:${token}` : null;
  const { items: documentRequests, load: loadDocumentRequests } = useCachedPanelData<DocumentRequest[]>(
    requestsCacheKey,
    () => getDocumentRequests(token!, dealId)
  );

  const identityCacheKey = token ? `deal-identity:${dealId}:${token}` : null;
  const { items: identity, load: loadIdentity } = useCachedPanelData<IdentityVerificationSummary>(
    identityCacheKey,
    () => getIdentityVerification(token!, dealId)
  );

  const agreementsCacheKey = token ? `deal-agreements:${dealId}:${token}` : null;
  const { items: agreements, load: loadAgreements } = useCachedPanelData<DealAgreement[]>(
    agreementsCacheKey,
    () => getAgreements(token!, dealId)
  );

  const negotiationsCacheKey = token ? `deal-offline-negotiations:${dealId}:${token}` : null;
  const { items: offlineNegotiations, load: loadOfflineNegotiations } = useCachedPanelData<OfflineNegotiationRecord[]>(
    negotiationsCacheKey,
    () => getOfflineNegotiations(token!, dealId)
  );

  // Sellers get nothing from this endpoint, and a buyer with no sheet sent
  // yet gets a genuine `null` — wrapped in an object so that's
  // distinguishable from "hasn't loaded yet" (which the cache hook also
  // represents as `null`).
  const costSheetCacheKey = viewerRole === "BUYER" && token ? `deal-cost-sheet:${dealId}:${token}` : null;
  const { items: costSheetResult, load: loadCostSheet } = useCachedPanelData<{ sheet: CostSheetData | null }>(
    costSheetCacheKey,
    () => getCostSheet(token!, dealId).then((sheet) => ({ sheet }))
  );

  const progressCacheKey = token ? `deal-progress:${dealId}:${token}` : null;
  const { items: progress, load: loadProgress } = useCachedPanelData<DealProgressData>(
    progressCacheKey,
    () => getDealProgress(token!, dealId)
  );

  function refreshAll() {
    load();
    loadDocumentRequests();
    loadIdentity();
    loadAgreements();
    loadOfflineNegotiations();
    loadCostSheet();
    loadProgress();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={refreshAll}
          className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10"
        >
          Refresh →
        </button>
      </div>
      <Panel loading={items === null && !error} error={error} empty={false} emptyText="">
        {items && (
          <TransactionBody
            data={items}
            viewerRole={viewerRole}
            viewerId={user?.id}
            documentRequests={documentRequests}
            identity={identity}
            agreements={agreements}
            offlineNegotiations={offlineNegotiations}
            costSheet={costSheetResult}
            progress={progress}
            onChanged={load}
            onDocumentRequestsChanged={loadDocumentRequests}
            onIdentityChanged={loadIdentity}
            onAgreementsChanged={loadAgreements}
            onOfflineNegotiationsChanged={loadOfflineNegotiations}
            onCostSheetChanged={loadCostSheet}
          />
        )}
      </Panel>
    </div>
  );
}
