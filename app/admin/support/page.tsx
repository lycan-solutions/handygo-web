"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Hand, RotateCcw } from "lucide-react";
import {
  COMPLAINT_PRIORITIES,
  COMPLAINT_SOURCES,
  COMPLAINT_STATUSES,
  fetchComplaints,
  type Complaint,
} from "@/lib/api/admin-complaints";
import {
  AccessGate,
  ErrorBanner,
  OpsBadge,
  PageHeader,
  Pagination,
  dateTime,
  inputClass,
  panelClass,
  secondaryButtonClass,
  shortId,
  statusKind,
  useAdminAccess,
} from "@/components/admin/operations/OperationsUi";

const PAGE_SIZE = 20;

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[var(--text-secondary)]">Loading tickets…</div>
      }
    >
      <SupportContent />
    </Suspense>
  );
}

function SupportContent() {
  const access = useAdminAccess();
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const priority = params.get("priority") ?? "";
  const source = params.get("source") ?? "";
  const humanRequested = params.get("humanRequested") ?? "";
  const search = params.get("search") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const [items, setItems] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setFilter = (key: string, value: string, reset = true) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (reset) next.delete("page");
    router.replace(`/admin/support?${next.toString()}`, { scroll: false });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchComplaints({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        source: source || undefined,
        humanRequested: humanRequested ? humanRequested === "true" : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, source, humanRequested, page]);

  useEffect(() => {
    if (access.allowed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [access.allowed, load]);

  const returnTo = encodeURIComponent(`/admin/support?${params.toString()}`);
  const filtered = Boolean(
    status || priority || source || humanRequested || search,
  );

  return (
    <AccessGate {...access}>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
          <PageHeader
            eyebrow="Support"
            title="Tickets"
            description="Every complaint raised from the app, the website bot, WhatsApp or email."
            action={
              <button onClick={load} className={secondaryButtonClass}>
                <RotateCcw className="h-4 w-4" />
                Refresh
              </button>
            }
          />

          {/* A customer who asked for a real person is the only thing on this
              page that cannot wait, so it gets its own control above the
              filter grid rather than being buried inside it. */}
          <button
            onClick={() =>
              setFilter("humanRequested", humanRequested === "true" ? "" : "true")
            }
            className={`mb-3 ${secondaryButtonClass} ${
              humanRequested === "true"
                ? "border-[var(--urgent)] text-[var(--urgent)]"
                : ""
            }`}
          >
            <Hand className="h-4 w-4" />
            {humanRequested === "true"
              ? "Showing only: asked for a human"
              : "Show only: asked for a human"}
          </button>

          <div
            className={`mb-5 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 ${panelClass}`}
          >
            <select
              value={status}
              onChange={(e) => setFilter("status", e.target.value)}
              className={inputClass}
            >
              <option value="">All statuses</option>
              {COMPLAINT_STATUSES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setFilter("priority", e.target.value)}
              className={inputClass}
            >
              <option value="">All priorities</option>
              {COMPLAINT_PRIORITIES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              value={source}
              onChange={(e) => setFilter("source", e.target.value)}
              className={inputClass}
            >
              <option value="">All sources</option>
              {COMPLAINT_SOURCES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <input
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  setFilter("search", e.currentTarget.value.trim());
              }}
              onBlur={(e) => setFilter("search", e.target.value.trim())}
              placeholder="Ticket ID, booking ID or phone"
              className={inputClass}
            />
            {filtered && (
              <button
                onClick={() => router.replace("/admin/support")}
                className="text-left text-sm font-semibold text-[var(--brand)]"
              >
                Clear filters
              </button>
            )}
          </div>

          {error && <ErrorBanner message={error} retry={load} />}
          {loading ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              Loading tickets…
            </div>
          ) : !error && items.length === 0 ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              {filtered
                ? "No tickets match the current filters."
                : "No tickets yet."}
            </div>
          ) : (
            !error && (
              <>
                <div className={`${panelClass} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1400px] w-full text-left text-sm">
                      <thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
                        <tr>
                          {[
                            "Created",
                            "Ticket",
                            "Issue",
                            "Priority",
                            "Source",
                            "Booking",
                            "Reporter",
                            "Ustaad",
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
                              <div className="mt-1 flex flex-wrap gap-1">
                                <OpsBadge
                                  value={item.status}
                                  kind={statusKind(item.status)}
                                />
                                {item.humanRequested && (
                                  <OpsBadge
                                    value="WANTS A HUMAN"
                                    kind="urgent"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {item.issueTypes.map((t) => (
                                  <OpsBadge key={t} value={t} />
                                ))}
                              </div>
                              {item.otherText && (
                                <p className="mt-1 max-w-[240px] truncate text-[var(--text-secondary)]">
                                  {item.otherText}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <OpsBadge
                                value={item.priority}
                                kind={statusKind(item.priority)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <OpsBadge value={item.source} />
                            </td>
                            <td className="px-4 py-3">
                              {item.booking ? (
                                <>
                                  <p className="font-semibold">
                                    {shortId(item.booking.id)}
                                  </p>
                                  <p className="text-[var(--text-secondary)]">
                                    {item.booking.title ?? item.booking.status}
                                  </p>
                                </>
                              ) : (
                                <span className="text-[var(--text-secondary)]">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {item.reporter ? (
                                <>
                                  <p className="font-semibold">
                                    {item.reporter.phone}
                                  </p>
                                  <p className="text-[var(--text-secondary)]">
                                    {item.reporter.role}
                                  </p>
                                </>
                              ) : (
                                <span className="text-[var(--text-secondary)]">
                                  Not signed in
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {item.reportedWorker ? (
                                <>
                                  <p className="font-semibold">
                                    {item.reportedWorker.firstName}{" "}
                                    {item.reportedWorker.lastName}
                                  </p>
                                  <p className="text-[var(--text-secondary)]">
                                    {item.reportedWorker.user.phone}
                                  </p>
                                </>
                              ) : (
                                <span className="text-[var(--text-secondary)]">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {item.assignedTo?.phone ?? "Unassigned"}
                            </td>
                            <td className="px-4 py-3 text-[var(--text-secondary)]">
                              {dateTime(item.updatedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/admin/support/${item.id}?returnTo=${returnTo}`}
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
