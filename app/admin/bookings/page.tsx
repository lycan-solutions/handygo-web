"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Plus, RotateCcw, Search } from "lucide-react";
import {
  BOOKING_LANES,
  BOOKING_STATUSES,
  SETTLEMENT_SOURCES,
  correctBookingSettlement,
  createBookingSettlement,
  fetchAdminBooking,
  fetchAdminBookings,
  type AdminBooking,
  type Settlement,
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

export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[var(--text-secondary)]">
          Loading bookings…
        </div>
      }
    >
      <AdminBookingsContent />
    </Suspense>
  );
}

function AdminBookingsContent() {
  const access = useAdminAccess();
  const router = useRouter();
  const params = useSearchParams();
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [detailError, setDetailError] = useState("");
  const search = params.get("search") ?? "";
  const status = params.get("status") ?? "";
  const lane = params.get("lane") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const bookingId = params.get("bookingId");

  const setFilter = (key: string, value: string, resetPage = true) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (resetPage) next.delete("page");
    router.replace(`/admin/bookings?${next.toString()}`, { scroll: false });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminBookings({
        search: search || undefined,
        status: status || undefined,
        lane: lane || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [search, status, lane, from, to, page]);

  const loadBookingDetail = useCallback(async (id: string) => {
    await fetchAdminBooking(id)
      .then((value) => {
        setDetailError("");
        setSelected(value);
      })
      .catch((err) =>
        setDetailError(
          err instanceof Error ? err.message : "Failed to load booking detail.",
        ),
      );
  }, []);

  useEffect(() => {
    if (access.allowed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [access.allowed, load]);
  useEffect(() => {
    if (!access.allowed || !bookingId) {
      return;
    }
    void loadBookingDetail(bookingId);
  }, [access.allowed, bookingId, loadBookingDetail]);
  const openBooking = (id: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("bookingId", id);
    router.push(`/admin/bookings?${next.toString()}`, { scroll: false });
  };
  const closeBooking = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("bookingId");
    router.back();
    if (window.history.length <= 1)
      router.replace(`/admin/bookings?${next.toString()}`);
  };

  return (
    <AccessGate {...access}>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
          <PageHeader
            eyebrow="Operations"
            title="Bookings"
            description="Live booking and immutable settlement records from the backend."
            action={
              <button onClick={load} className={secondaryButtonClass}>
                <RotateCcw className="h-4 w-4" />
                Refresh
              </button>
            }
          />

          <div className={`mb-5 p-4 ${panelClass}`}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <label className="relative md:col-span-2">
                <span className="sr-only">Search bookings</span>
                <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--text-secondary)]" />
                <input
                  defaultValue={search}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setFilter("search", e.currentTarget.value.trim());
                  }}
                  placeholder="Booking ID, title or phone"
                  className={`${inputClass} w-full pl-9`}
                />
              </label>
              <select
                value={status}
                onChange={(e) => setFilter("status", e.target.value)}
                className={inputClass}
                aria-label="Booking status"
              >
                <option value="">All statuses</option>
                {BOOKING_STATUSES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                value={lane}
                onChange={(e) => setFilter("lane", e.target.value)}
                className={inputClass}
                aria-label="Booking lane"
              >
                <option value="">All lanes</option>
                {BOOKING_LANES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <input
                type="date"
                value={from}
                onChange={(e) => setFilter("from", e.target.value)}
                className={inputClass}
                aria-label="From date"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setFilter("to", e.target.value)}
                className={inputClass}
                aria-label="To date"
              />
            </div>
            {(search || status || lane || from || to) && (
              <button
                onClick={() => router.replace("/admin/bookings")}
                className="mt-3 text-sm font-semibold text-[var(--brand)]"
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
              Loading bookings…
            </div>
          ) : !error && items.length === 0 ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              No bookings match the current filters.
            </div>
          ) : (
            !error && (
              <>
                <div className={`${panelClass} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1500px] w-full text-left text-sm">
                      <thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
                        <tr>
                          {[
                            "Booking",
                            "Created",
                            "Client",
                            "Ustaad",
                            "Service",
                            "Lane",
                            "Expected",
                            "Received",
                            "Breakdown",
                            "Commission",
                            "Shortfall",
                            "Settlement",
                            "Action",
                          ].map((h) => (
                            <th key={h} className="px-4 py-3 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((booking) => {
                          const live = booking.settlements.find(
                            (s) => s.isCurrent,
                          );
                          return (
                            <tr
                              key={booking.id}
                              className="border-b border-[var(--border)] hover:bg-[var(--brand-light)]"
                            >
                              <td className="px-4 py-3">
                                <p className="font-bold text-[var(--foreground)]">
                                  {shortId(booking.id)}
                                </p>
                                <OpsBadge
                                  value={booking.status}
                                  kind={statusKind(booking.status)}
                                />
                              </td>
                              <td className="px-4 py-3 text-[var(--text-secondary)]">
                                {dateTime(booking.createdAt)}
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-semibold">
                                  {booking.clientProfile.firstName}{" "}
                                  {booking.clientProfile.lastName}
                                </p>
                                <p className="text-[var(--text-secondary)]">
                                  {booking.clientProfile.user.phone}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                {booking.workerProfile ? (
                                  <>
                                    <p className="font-semibold">
                                      {booking.workerProfile.firstName}{" "}
                                      {booking.workerProfile.lastName}
                                    </p>
                                    <p className="text-[var(--text-secondary)]">
                                      {booking.workerProfile.user.phone}
                                    </p>
                                  </>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {booking.category.name}
                              </td>
                              <td className="px-4 py-3">
                                <OpsBadge value={booking.lane} />
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                {money(live?.expectedTotal)}
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                {money(live?.received)}
                              </td>
                              <td className="px-4 py-3 text-xs leading-5 text-[var(--text-secondary)]">
                                {live ? (
                                  <>
                                    <div>Parts {money(live.partsPaid)}</div>
                                    <div>Labour {money(live.labourPaid)}</div>
                                    <div>Fee {money(live.feePaid)}</div>
                                  </>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-right font-medium">
                                  {money(live?.commission)}
                                </p>
                                <div className="mt-1 text-right">
                                  <OpsBadge
                                    value={booking.commissionStatus}
                                    kind={statusKind(booking.commissionStatus)}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                {money(live?.shortfall)}
                              </td>
                              <td className="px-4 py-3">
                                {live ? (
                                  <>
                                    <OpsBadge
                                      value={live.source}
                                      kind={statusKind(live.source)}
                                    />
                                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                      Live · {booking.settlements.length - 1}{" "}
                                      superseded
                                    </p>
                                  </>
                                ) : (
                                  <span className="text-[var(--text-secondary)]">
                                    No settlement
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => openBooking(booking.id)}
                                  className={secondaryButtonClass}
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onPage={(value) => setFilter("page", String(value), false)}
                />
              </>
            )
          )}
          {bookingId && (
            <div className="fixed inset-0 z-50 flex justify-end bg-[var(--scrim)]">
              <button
                aria-label="Close booking detail"
                className="flex-1 cursor-default"
                onClick={closeBooking}
              />
              <aside className="h-full w-full max-w-3xl overflow-y-auto border-l border-[var(--border)] bg-[var(--background)] p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Booking detail</h2>
                  <button
                    onClick={closeBooking}
                    className={secondaryButtonClass}
                  >
                    Close
                  </button>
                </div>
                {detailError ? (
                  <ErrorBanner message={detailError} />
                ) : !selected || selected.id !== bookingId ? (
                  <p className="mt-6 text-[var(--text-secondary)]">
                    Loading booking detail…
                  </p>
                ) : (
                  <BookingDetail
                    booking={selected}
                    onSettlementCreated={async () => {
                      await Promise.all([
                        loadBookingDetail(selected.id),
                        load(),
                      ]);
                    }}
                  />
                )}
              </aside>
            </div>
          )}
        </div>
      </div>
    </AccessGate>
  );
}

function BookingDetail({
  booking,
  onSettlementCreated,
}: {
  booking: AdminBooking;
  onSettlementCreated: () => Promise<void>;
}) {
  const [writeMode, setWriteMode] = useState<"create" | "correct" | null>(null);
  const live = booking.settlements.find((settlement) => settlement.isCurrent);
  const settleable = ["COMPLETED", "AWAITING_CONFIRMATION", "SETTLED"].includes(
    booking.status,
  );
  const correctionLocked = Boolean(live?.collectionItems?.length);
  return (
    <div className="mt-5 space-y-5">
      <section className={`p-5 ${panelClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-[var(--text-secondary)]">
              Booking reference
            </p>
            <p className="font-bold">{booking.id}</p>
          </div>
          <div className="flex gap-2">
            <OpsBadge
              value={booking.status}
              kind={statusKind(booking.status)}
            />
            <OpsBadge value={booking.lane} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DetailFact
            label="Client"
            value={`${booking.clientProfile.firstName} ${booking.clientProfile.lastName} · ${booking.clientProfile.user.phone}`}
          />
          <DetailFact
            label="Ustaad"
            value={
              booking.workerProfile
                ? `${booking.workerProfile.firstName} ${booking.workerProfile.lastName} · ${booking.workerProfile.user.phone}`
                : "—"
            }
          />
          <DetailFact label="Service" value={booking.category.name} />
          <DetailFact label="Payment status" value={booking.paymentStatus} />
          <DetailFact
            label="Commission status"
            value={booking.commissionStatus}
          />
          <DetailFact label="Completed" value={dateTime(booking.completedAt)} />
        </div>
      </section>
      <section className={`p-5 ${panelClass}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold">Immutable settlement history</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              No settlement can be edited from this screen.
            </p>
          </div>
          {!live ? (
            <button
              type="button"
              disabled={!settleable || !booking.workerProfile}
              onClick={() => setWriteMode("create")}
              className={primaryButtonClass}
            >
              <Plus className="h-4 w-4" />
              Create Settlement
            </button>
          ) : (
            <button
              type="button"
              disabled={correctionLocked}
              onClick={() => setWriteMode("correct")}
              className={secondaryButtonClass}
              title={
                correctionLocked
                  ? "Collected settlements cannot be corrected"
                  : undefined
              }
            >
              Create corrected settlement
            </button>
          )}
        </div>
        {!settleable && !live && (
          <p className="mt-3 text-sm text-[var(--warning)]">
            The backend permits settlement only for completed bookings.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {booking.settlements.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              No settlement has been recorded.
            </p>
          ) : (
            booking.settlements.map((settlement) => {
              const isLive = settlement.isCurrent;
              return (
                <article
                  key={settlement.id}
                  className={`rounded-xl border p-4 ${isLive ? "border-[var(--brand)] bg-[var(--brand-light)]" : "border-[var(--border)] bg-[var(--surface-subtle)]"}`}
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-bold">{settlement.id}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {dateTime(settlement.settledAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <OpsBadge
                        value={isLive ? "LIVE" : "SUPERSEDED"}
                        kind={isLive ? "brand" : "neutral"}
                      />
                      <OpsBadge value={settlement.source} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <DetailFact
                      label="Expected"
                      value={money(settlement.expectedTotal)}
                    />
                    <DetailFact
                      label="Received"
                      value={money(settlement.received)}
                    />
                    <DetailFact
                      label="Parts paid"
                      value={money(settlement.partsPaid)}
                    />
                    <DetailFact
                      label="Labour paid"
                      value={money(settlement.labourPaid)}
                    />
                    <DetailFact
                      label="Fee paid"
                      value={money(settlement.feePaid)}
                    />
                    <DetailFact
                      label="Commission"
                      value={money(settlement.commission)}
                    />
                    <DetailFact
                      label="Munafa"
                      value={money(settlement.munafa)}
                    />
                    <DetailFact
                      label="Shortfall"
                      value={money(settlement.shortfall)}
                    />
                    <DetailFact
                      label="HandyGo pays"
                      value={money(settlement.handygoPays)}
                    />
                    <DetailFact
                      label="Supersedes"
                      value={settlement.supersedesId ?? "Original row"}
                    />
                    <DetailFact
                      label="Superseded by"
                      value={settlement.supersededBy?.id ?? "Current row"}
                    />
                  </div>
                  {settlement.note && (
                    <p className="mt-3 rounded-lg bg-[var(--surface)] p-3 text-sm">
                      {settlement.note}
                    </p>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
      {writeMode && (
        <SettlementWriteDialog
          booking={booking}
          current={writeMode === "correct" ? live : undefined}
          onClose={() => setWriteMode(null)}
          onSuccess={async () => {
            setWriteMode(null);
            await onSettlementCreated();
          }}
        />
      )}
    </div>
  );
}

function SettlementWriteDialog({
  booking,
  current,
  onClose,
  onSuccess,
}: {
  booking: AdminBooking;
  current?: Settlement;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const correction = Boolean(current);
  const [received, setReceived] = useState(
    current ? String(current.received) : "",
  );
  const [source, setSource] =
    useState<(typeof SETTLEMENT_SOURCES)[number]>("ADMIN");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const parsedReceived = Number(received);
  const validReceived =
    /^\d+$/.test(received) && Number.isSafeInteger(parsedReceived);
  const submit = async () => {
    if (!validReceived || (correction && !note.trim())) return;
    setSubmitting(true);
    setError("");
    try {
      const data = {
        received: parsedReceived,
        source,
        note: note.trim() || undefined,
      };
      if (current) {
        await correctBookingSettlement(booking.id, {
          ...data,
          supersedesId: current.id,
        });
      } else {
        await createBookingSettlement(booking.id, data);
      }
      await onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Settlement could not be created.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[var(--scrim)] p-4">
      <div className={`w-full max-w-lg p-5 ${panelClass}`}>
        <h3 className="text-xl font-bold">
          {correction ? "Create corrected settlement" : "Create Settlement"}
        </h3>
        {correction && (
          <p className="mt-3 rounded-xl bg-[var(--warning-surface)] p-3 text-sm text-[var(--warning)]">
            This creates a new immutable settlement row. The previous settlement
            remains in history.
          </p>
        )}
        {current && (
          <div className="mt-4">
            <DetailFact
              label="Expected amount"
              value={money(current.expectedTotal)}
            />
          </div>
        )}
        <div className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm font-semibold">
            Received amount
            <input
              inputMode="numeric"
              value={received}
              onChange={(event) => setReceived(event.target.value)}
              className={inputClass}
              placeholder="Whole PKR amount"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Settlement source
            <select
              value={source}
              onChange={(event) =>
                setSource(
                  event.target.value as (typeof SETTLEMENT_SOURCES)[number],
                )
              }
              className={inputClass}
            >
              {SETTLEMENT_SOURCES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            {correction ? "Correction reason" : "Reason / notes (optional)"}
            <textarea
              rows={4}
              maxLength={2000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-[var(--error)]">{error}</p>}
        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          Commission, allocations, shortfall, munafa, and totals are calculated
          by the backend after submission.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            disabled={submitting}
            onClick={onClose}
            className={secondaryButtonClass}
          >
            Cancel
          </button>
          <button
            disabled={
              submitting || !validReceived || (correction && !note.trim())
            }
            onClick={submit}
            className={primaryButtonClass}
          >
            {submitting
              ? "Creating…"
              : correction
                ? "Create correction"
                : "Create settlement"}
          </button>
        </div>
      </div>
    </div>
  );
}
function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 font-semibold break-words">{value}</p>
    </div>
  );
}
