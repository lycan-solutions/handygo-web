"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, RotateCcw } from "lucide-react";
import {
  CASE_PRIORITIES,
  CASE_STATUSES,
  CASE_TYPES,
  fetchSettlementCases,
  type SettlementCase,
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
  secondaryButtonClass,
  shortId,
  statusKind,
  useAdminAccess,
} from "@/components/admin/operations/OperationsUi";

const PAGE_SIZE = 20;
export default function SettlementCasesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[var(--text-secondary)]">Loading cases…</div>
      }
    >
      <SettlementCasesContent />
    </Suspense>
  );
}
function SettlementCasesContent() {
  const access = useAdminAccess();
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const type = params.get("type") ?? "";
  const priority = params.get("priority") ?? "";
  const workerProfileId = params.get("workerProfileId") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const [items, setItems] = useState<SettlementCase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const setFilter = (key: string, value: string, reset = true) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (reset) next.delete("page");
    router.replace(`/admin/cases?${next.toString()}`, { scroll: false });
  };
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchSettlementCases({
        status: status || undefined,
        type: type || undefined,
        priority: priority || undefined,
        workerProfileId: workerProfileId || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cases.");
    } finally {
      setLoading(false);
    }
  }, [status, type, priority, workerProfileId, page]);
  useEffect(() => {
    if (access.allowed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [access.allowed, load]);
  const returnTo = encodeURIComponent(`/admin/cases?${params.toString()}`);
  return (
    <AccessGate {...access}>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
          <PageHeader
            eyebrow="Operations"
            title="Settlement cases"
            description="Manual exception queue backed by settlement case records."
            action={
              <button onClick={load} className={secondaryButtonClass}>
                <RotateCcw className="h-4 w-4" />
                Refresh
              </button>
            }
          />
          <div
            className={`mb-5 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 ${panelClass}`}
          >
            <select
              value={status}
              onChange={(e) => setFilter("status", e.target.value)}
              className={inputClass}
            >
              <option value="">All statuses</option>
              {CASE_STATUSES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setFilter("type", e.target.value)}
              className={inputClass}
            >
              <option value="">All case types</option>
              {CASE_TYPES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setFilter("priority", e.target.value)}
              className={inputClass}
            >
              <option value="">All priorities</option>
              {CASE_PRIORITIES.map((v) => (
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
            {(status || type || priority || workerProfileId) && (
              <button
                onClick={() => router.replace("/admin/cases")}
                className="text-left text-sm font-semibold text-[var(--brand)]"
              >
                Clear filters
              </button>
            )}
          </div>
          {error && <ErrorBanner message={error} retry={load} />}{" "}
          {loading ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              Loading cases…
            </div>
          ) : !error && items.length === 0 ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              No settlement cases match the current filters.
            </div>
          ) : (
            !error && (
              <>
                <div className={`${panelClass} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1250px] w-full text-left text-sm">
                      <thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
                        <tr>
                          {[
                            "Created",
                            "Case",
                            "Type",
                            "Priority",
                            "Booking",
                            "Ustaad",
                            "Affected money",
                            "Settlement",
                            "Owner",
                            "Last activity",
                            "Action",
                          ].map((h) => (
                            <th key={h} className="px-4 py-3 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-[var(--border)] hover:bg-[var(--brand-light)]"
                          >
                            <td className="px-4 py-3 text-[var(--text-secondary)]">
                              {dateTime(item.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold">{shortId(item.id)}</p>
                              <OpsBadge
                                value={item.status}
                                kind={statusKind(item.status)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <OpsBadge
                                value={item.type}
                                kind={statusKind(item.type)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <OpsBadge
                                value={item.priority}
                                kind={statusKind(item.priority)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold">
                                {shortId(item.booking.id)}
                              </p>
                              <p className="text-[var(--text-secondary)]">
                                {item.booking.lane}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold">
                                {item.workerProfile.firstName}{" "}
                                {item.workerProfile.lastName}
                              </p>
                              <p className="text-[var(--text-secondary)]">
                                {item.workerProfile.user.phone}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p>{money(item.settlement.shortfall)}</p>
                              <p className="text-xs text-[var(--text-secondary)]">
                                Shortfall
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold">
                                {shortId(item.settlement.id)}
                              </p>
                              <OpsBadge value={item.settlement.source} />
                            </td>
                            <td className="px-4 py-3">
                              {item.assignedTo?.phone ?? "Unassigned"}
                            </td>
                            <td className="px-4 py-3 text-[var(--text-secondary)]">
                              {dateTime(item.updatedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/admin/cases/${item.id}?returnTo=${returnTo}`}
                                className={secondaryButtonClass}
                              >
                                <Eye className="h-4 w-4" />
                                Open
                              </Link>
                            </td>
                          </tr>
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
        </div>
      </div>
    </AccessGate>
  );
}
