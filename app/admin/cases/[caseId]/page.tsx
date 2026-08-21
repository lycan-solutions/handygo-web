"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MessageSquarePlus, PhoneCall, RotateCcw, Save } from "lucide-react";
import {
  addCaseNote,
  addContactAttempt,
  CASE_PRIORITIES,
  CASE_STATUSES,
  CONTACT_CHANNELS,
  CONTACT_OUTCOMES,
  fetchAdminBooking,
  fetchSettlementCase,
  updateSettlementCase,
  type AdminBooking,
  type SettlementCase,
} from "@/lib/api/admin-operations";
import {
  AccessGate,
  BackLink,
  ErrorBanner,
  OpsBadge,
  PageHeader,
  dateTime,
  inputClass,
  money,
  panelClass,
  primaryButtonClass,
  shortId,
  statusKind,
  useAdminAccess,
} from "@/components/admin/operations/OperationsUi";

const moneyRows: Array<[string, keyof SettlementCase["settlement"]]> = [
  ["Expected parts", "expectedParts"],
  ["Expected labour", "expectedLabour"],
  ["Expected fee", "expectedFee"],
  ["Expected total", "expectedTotal"],
  ["Actual received", "received"],
  ["Parts paid", "partsPaid"],
  ["Labour paid", "labourPaid"],
  ["Fee paid", "feePaid"],
  ["Commission", "commission"],
  ["Munafa", "munafa"],
  ["Shortfall", "shortfall"],
  ["HandyGo pays", "handygoPays"],
];

export default function SettlementCaseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[var(--text-secondary)]">Loading case…</div>
      }
    >
      <SettlementCaseDetailContent />
    </Suspense>
  );
}
function SettlementCaseDetailContent() {
  const access = useAdminAccess();
  const route = useParams<{ caseId: string }>();
  const search = useSearchParams();
  const caseId = route.caseId;
  const returnTo = search.get("returnTo") || "/admin/cases";
  const [item, setItem] = useState<SettlementCase | null>(null);
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [note, setNote] = useState("");
  const [channel, setChannel] = useState<string>(CONTACT_CHANNELS[0]);
  const [outcome, setOutcome] = useState<string>(CONTACT_OUTCOMES[0]);
  const [contactNote, setContactNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const detail = await fetchSettlementCase(caseId);
      setItem(detail);
      setStatus(detail.status);
      setPriority(detail.priority);
      const fullBooking = await fetchAdminBooking(detail.bookingId);
      setBooking(fullBooking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load case.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);
  useEffect(() => {
    if (access.allowed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [access.allowed, load]);
  const timeline = useMemo(
    () =>
      item
        ? [
            ...item.events.map((v) => ({
              at: v.createdAt,
              title: v.type,
              detail: v.actor.phone,
            })),
            ...item.notes.map((v) => ({
              at: v.createdAt,
              title: "NOTE",
              detail: `${v.author.phone}: ${v.body}`,
            })),
            ...item.contactAttempts.map((v) => ({
              at: v.contactedAt,
              title: `${v.channel} · ${v.outcome}`,
              detail: `${v.actor.phone}${v.note ? `: ${v.note}` : ""}`,
            })),
          ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        : [],
    [item],
  );
  const perform = async (work: () => Promise<unknown>) => {
    setSaving(true);
    setError("");
    try {
      await work();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <AccessGate {...access}>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1500px]">
          <BackLink href={returnTo}>Back to cases</BackLink>
          {error && <ErrorBanner message={error} retry={load} />}{" "}
          {loading ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              Loading case…
            </div>
          ) : (
            item && (
              <>
                <PageHeader
                  eyebrow="Settlement case"
                  title={`Case ${shortId(item.id)}`}
                  description={`Booking ${shortId(item.bookingId)} · opened ${dateTime(item.createdAt)}`}
                  action={
                    <div className="flex gap-2">
                      <OpsBadge
                        value={item.type}
                        kind={statusKind(item.type)}
                      />
                      <OpsBadge
                        value={item.status}
                        kind={statusKind(item.status)}
                      />
                    </div>
                  }
                />
                <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
                  <div className="space-y-5">
                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="text-lg font-bold">Booking and people</h2>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Fact
                          label="Booking"
                          value={shortId(item.booking.id)}
                        />
                        <Fact
                          label="Booking status"
                          value={item.booking.status}
                        />
                        <Fact label="Lane" value={item.booking.lane} />
                        <Fact
                          label="Service"
                          value={booking?.category.name ?? "—"}
                        />
                        <Fact
                          label="Client"
                          value={
                            booking
                              ? `${booking.clientProfile.firstName} ${booking.clientProfile.lastName}`
                              : "—"
                          }
                        />
                        <Fact
                          label="Client phone"
                          value={booking?.clientProfile.user.phone ?? "—"}
                        />
                        <Fact
                          label="Ustaad"
                          value={`${item.workerProfile.firstName} ${item.workerProfile.lastName}`}
                        />
                        <Fact
                          label="Ustaad phone"
                          value={item.workerProfile.user.phone}
                        />
                      </div>
                    </section>
                    <section className={`p-5 ${panelClass}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold">
                            Current case settlement
                          </h2>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Amounts are displayed exactly as returned by the
                            backend.
                          </p>
                        </div>
                        <OpsBadge value={item.settlement.source} />
                      </div>
                      <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
                        {moneyRows.map(([label, key]) => (
                          <div key={label} className="bg-[var(--surface)] p-3">
                            <p className="text-xs text-[var(--text-secondary)]">
                              {label}
                            </p>
                            <p className="mt-1 font-semibold tabular-nums">
                              {money(item.settlement[key] as number)}
                            </p>
                          </div>
                        ))}
                      </div>
                      {item.settlement.note && (
                        <p className="mt-4 rounded-xl bg-[var(--surface-subtle)] p-3 text-sm">
                          {item.settlement.note}
                        </p>
                      )}
                    </section>
                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="text-lg font-bold">
                        Immutable settlement history
                      </h2>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Live is the row with no supersededBy relationship.
                        Historical rows remain read-only.
                      </p>
                      <div className="mt-4 space-y-3">
                        {booking?.settlements.map((settlement) => {
                          const live = settlement.supersededBy === null;
                          return (
                            <div
                              key={settlement.id}
                              className={`rounded-xl border p-4 ${live ? "border-[var(--brand)] bg-[var(--brand-light)]" : "border-[var(--border)] bg-[var(--surface-subtle)]"}`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="font-bold">
                                    {shortId(settlement.id)}
                                  </p>
                                  <p className="text-xs text-[var(--text-secondary)]">
                                    {dateTime(settlement.settledAt)}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <OpsBadge
                                    value={live ? "LIVE" : "SUPERSEDED"}
                                    kind={live ? "brand" : "neutral"}
                                  />
                                  <OpsBadge value={settlement.source} />
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2 text-sm lg:grid-cols-4">
                                <Fact
                                  label="Received"
                                  value={money(settlement.received)}
                                />
                                <Fact
                                  label="Commission"
                                  value={money(settlement.commission)}
                                />
                                <Fact
                                  label="Shortfall"
                                  value={money(settlement.shortfall)}
                                />
                                <Fact
                                  label="Supersedes"
                                  value={
                                    settlement.supersedesId
                                      ? shortId(settlement.supersedesId)
                                      : "Original"
                                  }
                                />
                              </div>
                            </div>
                          );
                        }) ?? (
                          <p className="text-[var(--text-secondary)]">
                            Settlement history unavailable.
                          </p>
                        )}
                      </div>
                    </section>
                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="text-lg font-bold">Case controls</h2>
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className={inputClass}
                        >
                          {CASE_STATUSES.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className={inputClass}
                        >
                          {CASE_PRIORITIES.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                        <button
                          disabled={
                            saving ||
                            (status === item.status &&
                              priority === item.priority)
                          }
                          onClick={() =>
                            perform(() =>
                              updateSettlementCase(item.id, {
                                status,
                                priority,
                              }),
                            )
                          }
                          className={primaryButtonClass}
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-[var(--text-secondary)]">
                        This changes case workflow only. Settlement money cannot
                        be edited here.
                      </p>
                    </section>
                  </div>
                  <aside className="space-y-5">
                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="font-bold">Internal note</h2>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                        maxLength={4000}
                        className={`${inputClass} mt-3 w-full`}
                        placeholder="Append an internal note"
                      />
                      <button
                        disabled={saving || !note.trim()}
                        onClick={() =>
                          perform(async () => {
                            await addCaseNote(item.id, note.trim());
                            setNote("");
                          })
                        }
                        className={`mt-3 w-full ${primaryButtonClass}`}
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                        Add note
                      </button>
                    </section>
                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="font-bold">Contact attempt</h2>
                      <div className="mt-3 grid gap-3">
                        <select
                          value={channel}
                          onChange={(e) => setChannel(e.target.value)}
                          className={inputClass}
                        >
                          {CONTACT_CHANNELS.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                        <select
                          value={outcome}
                          onChange={(e) => setOutcome(e.target.value)}
                          className={inputClass}
                        >
                          {CONTACT_OUTCOMES.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                        <input
                          type="datetime-local"
                          value={followUpAt}
                          onChange={(e) => setFollowUpAt(e.target.value)}
                          className={inputClass}
                        />
                        <textarea
                          value={contactNote}
                          onChange={(e) => setContactNote(e.target.value)}
                          rows={3}
                          maxLength={2000}
                          className={inputClass}
                          placeholder="Optional contact note"
                        />
                        <button
                          disabled={saving}
                          onClick={() =>
                            perform(async () => {
                              await addContactAttempt(item.id, {
                                channel,
                                outcome,
                                note: contactNote.trim() || undefined,
                                followUpAt: followUpAt
                                  ? new Date(followUpAt).toISOString()
                                  : undefined,
                              });
                              setContactNote("");
                              setFollowUpAt("");
                            })
                          }
                          className={primaryButtonClass}
                        >
                          <PhoneCall className="h-4 w-4" />
                          Record attempt
                        </button>
                      </div>
                    </section>
                    <section className={`p-5 ${panelClass}`}>
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold">Activity</h2>
                        <button onClick={load} className="text-[var(--brand)]">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 space-y-4">
                        {timeline.length === 0 ? (
                          <p className="text-sm text-[var(--text-secondary)]">
                            No activity recorded.
                          </p>
                        ) : (
                          timeline.map((entry, index) => (
                            <div
                              key={`${entry.at}-${index}`}
                              className="border-l-2 border-[var(--border)] pl-3"
                            >
                              <p className="text-xs font-bold text-[var(--brand)]">
                                {entry.title}
                              </p>
                              <p className="mt-1 text-sm break-words">
                                {entry.detail}
                              </p>
                              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                {dateTime(entry.at)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  </aside>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </AccessGate>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 font-semibold break-words">{value}</p>
    </div>
  );
}
