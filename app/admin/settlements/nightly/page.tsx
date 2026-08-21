"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, RotateCcw, Sparkles } from "lucide-react";
import {
  COLLECTION_STATUSES,
  fetchCommissionCollections,
  generateNightlyCommission,
  updateCommissionCollection,
  type CommissionCollection,
} from "@/lib/api/admin-operations";
import {
  AccessGate,
  ErrorBanner,
  OpsBadge,
  PageHeader,
  Pagination,
  dateTime,
  inputClass,
  money,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  shortId,
  statusKind,
  useAdminAccess,
} from "@/components/admin/operations/OperationsUi";

const PAGE_SIZE = 20;
export default function NightlyCommissionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[var(--text-secondary)]">
          Loading collections…
        </div>
      }
    >
      <NightlyCommissionContent />
    </Suspense>
  );
}
function NightlyCommissionContent() {
  const access = useAdminAccess();
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const collectionDate = params.get("collectionDate") ?? "";
  const workerProfileId = params.get("workerProfileId") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const [items, setItems] = useState<CommissionCollection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionId, setActionId] = useState("");
  const [failureId, setFailureId] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const setFilter = (key: string, value: string, reset = true) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (reset) next.delete("page");
    router.replace(`/admin/settlements/nightly?${next.toString()}`, {
      scroll: false,
    });
  };
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchCommissionCollections({
        status: status || undefined,
        collectionDate: collectionDate || undefined,
        workerProfileId: workerProfileId || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load commission collections.",
      );
    } finally {
      setLoading(false);
    }
  }, [status, collectionDate, workerProfileId, page]);
  useEffect(() => {
    if (access.allowed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [access.allowed, load]);
  const mark = async (
    id: string,
    next: "COLLECTED" | "FAILED",
    reason?: string,
  ) => {
    setActionId(id);
    setError("");
    try {
      await updateCommissionCollection(id, next, reason);
      setFailureId(null);
      setFailureReason("");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Collection update failed.",
      );
    } finally {
      setActionId("");
    }
  };
  const generate = async () => {
    setGenerating(true);
    setError("");
    setGenerationMessage("");
    try {
      const result = await generateNightlyCommission(
        collectionDate || undefined,
      );
      setGenerationMessage(
        `Nightly snapshot ready for ${result.collectionDate}: ${result.workerCount} Ustaads, ${money(result.totalAmount)}.`,
      );
      if (collectionDate !== result.collectionDate) {
        setFilter("collectionDate", result.collectionDate);
      } else {
        await load();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nightly generation failed.",
      );
    } finally {
      setGenerating(false);
    }
  };
  return (
    <AccessGate {...access}>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
          <PageHeader
            eyebrow="Operations"
            title="Nightly commission"
            description="Immutable nightly collection snapshots grouped by Ustaad."
            action={
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={generating}
                  onClick={generate}
                  className={primaryButtonClass}
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? "Generating…" : "Generate Nightly Commission"}
                </button>
                <button onClick={load} className={secondaryButtonClass}>
                  <RotateCcw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            }
          />
          <div className={`mb-5 grid gap-3 p-4 sm:grid-cols-3 ${panelClass}`}>
            <input
              type="date"
              value={collectionDate}
              onChange={(e) => setFilter("collectionDate", e.target.value)}
              className={inputClass}
            />
            <select
              value={status}
              onChange={(e) => setFilter("status", e.target.value)}
              className={inputClass}
            >
              <option value="">All collection statuses</option>
              {COLLECTION_STATUSES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <input
              value={workerProfileId}
              onChange={(e) =>
                setFilter("workerProfileId", e.target.value.trim())
              }
              placeholder="Ustaad profile UUID"
              className={inputClass}
            />
            {(status || collectionDate || workerProfileId) && (
              <button
                onClick={() => router.replace("/admin/settlements/nightly")}
                className="text-left text-sm font-semibold text-[var(--brand)]"
              >
                Clear filters
              </button>
            )}
          </div>
          {generationMessage && (
            <div className="mb-5 rounded-xl border border-[var(--brand)] bg-[var(--brand-light)] p-4 text-sm font-semibold text-[var(--brand)]">
              {generationMessage}
            </div>
          )}
          {error && <ErrorBanner message={error} retry={load} />}{" "}
          {loading ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              Loading commission collections…
            </div>
          ) : !error && items.length === 0 ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              No nightly commission collections match the current filters.
            </div>
          ) : (
            !error && (
              <>
                <div className={`${panelClass} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full text-left text-sm">
                      <thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
                        <tr>
                          {[
                            "Ustaad",
                            "Collection date",
                            "Bookings",
                            "Commission amount",
                            "Status",
                            "Collected",
                            "Created",
                            "Actions",
                          ].map((h) => (
                            <th key={h} className="px-4 py-3 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((collection) => (
                          <CollectionRows
                            key={collection.id}
                            collection={collection}
                            open={expanded === collection.id}
                            toggle={() =>
                              setExpanded(
                                expanded === collection.id
                                  ? null
                                  : collection.id,
                              )
                            }
                            busy={actionId === collection.id}
                            onCollected={() => mark(collection.id, "COLLECTED")}
                            onFailed={() => setFailureId(collection.id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onPage={(v) => setFilter("page", String(v), false)}
                />
              </>
            )
          )}
          {failureId && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--scrim)] p-4">
              <div className={`w-full max-w-md p-5 ${panelClass}`}>
                <h2 className="text-lg font-bold">Mark collection failed</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  The backend requires a failure reason.
                </p>
                <textarea
                  autoFocus
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className={`${inputClass} mt-4 w-full`}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setFailureId(null);
                      setFailureReason("");
                    }}
                    className={secondaryButtonClass}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!failureReason.trim() || actionId === failureId}
                    onClick={() =>
                      mark(failureId, "FAILED", failureReason.trim())
                    }
                    className={primaryButtonClass}
                  >
                    Confirm failure
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccessGate>
  );
}

function CollectionRows({
  collection,
  open,
  toggle,
  busy,
  onCollected,
  onFailed,
}: {
  collection: CommissionCollection;
  open: boolean;
  toggle: () => void;
  busy: boolean;
  onCollected: () => void;
  onFailed: () => void;
}) {
  return (
    <>
      <tr className="border-b border-[var(--border)] hover:bg-[var(--brand-light)]">
        <td className="px-4 py-3">
          <p className="font-semibold">
            {collection.workerProfile.firstName}{" "}
            {collection.workerProfile.lastName}
          </p>
          <p className="text-[var(--text-secondary)]">
            {collection.workerProfile.user.phone}
          </p>
        </td>
        <td className="px-4 py-3">
          {new Date(collection.collectionDate).toLocaleDateString("en-PK")}
        </td>
        <td className="px-4 py-3">{collection.items.length}</td>
        <td className="px-4 py-3 font-bold tabular-nums">
          {money(collection.amount)}
        </td>
        <td className="px-4 py-3">
          <OpsBadge
            value={collection.status}
            kind={statusKind(collection.status)}
          />
          {collection.failureReason && (
            <p className="mt-1 max-w-52 text-xs text-[var(--error)]">
              {collection.failureReason}
            </p>
          )}
        </td>
        <td className="px-4 py-3">{dateTime(collection.collectedAt)}</td>
        <td className="px-4 py-3">{dateTime(collection.createdAt)}</td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button onClick={toggle} className={secondaryButtonClass}>
              {open ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Bookings
            </button>
            {collection.status === "PENDING" && (
              <>
                <button
                  disabled={busy}
                  onClick={onCollected}
                  className={primaryButtonClass}
                >
                  Mark collected
                </button>
                <button
                  disabled={busy}
                  onClick={onFailed}
                  className={secondaryButtonClass}
                >
                  Failed
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <td colSpan={8} className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-secondary)]">
                  <th className="pb-2 text-left">Booking</th>
                  <th className="pb-2 text-left">Settlement</th>
                  <th className="pb-2 text-right">Labour received</th>
                  <th className="pb-2 text-right">Commission item</th>
                  <th className="pb-2 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {collection.items.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="py-2">
                      <Link
                        className="font-semibold text-[var(--brand)]"
                        href={`/admin/bookings?search=${entry.settlement.bookingId}`}
                      >
                        {shortId(entry.settlement.bookingId)}
                      </Link>
                    </td>
                    <td className="py-2">{shortId(entry.settlementId)}</td>
                    <td className="py-2 text-right tabular-nums">
                      {money(entry.settlement.labourPaid)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {money(entry.amount)}
                    </td>
                    <td className="py-2">
                      <OpsBadge value={entry.settlement.source} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}
