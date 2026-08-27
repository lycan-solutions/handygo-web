"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Hand, RotateCcw, UserCheck, UserMinus } from "lucide-react";
import {
  ALLOWED_STATUS_TRANSITIONS,
  COMPLAINT_PRIORITIES,
  assignComplaint,
  changeComplaintPriority,
  changeComplaintStatus,
  fetchComplaint,
  requestHumanOnComplaint,
  type Complaint,
  type ComplaintPriority,
  type ComplaintStatus,
} from "@/lib/api/admin-complaints";
import {
  AccessGate,
  BackLink,
  ErrorBanner,
  OpsBadge,
  PageHeader,
  dateTime,
  inputClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  shortId,
  statusKind,
  useAdminAccess,
} from "@/components/admin/operations/OperationsUi";

/** The signed-in admin's own user id, for the "Assign to me" shortcut. */
function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("handygo_user");
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const id = (parsed as { id?: unknown })?.id;
    return typeof id === "string" ? id : null;
  } catch {
    return null;
  }
}

export default function ComplaintDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[var(--text-secondary)]">Loading ticket…</div>
      }
    >
      <ComplaintDetailContent />
    </Suspense>
  );
}

function ComplaintDetailContent() {
  const access = useAdminAccess();
  const route = useParams<{ complaintId: string }>();
  const search = useSearchParams();
  const complaintId = route.complaintId;
  const returnTo = search.get("returnTo") || "/admin/support";

  const [item, setItem] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ComplaintStatus | "">("");
  const [priority, setPriority] = useState<ComplaintPriority | "">("");
  const [assignee, setAssignee] = useState("");
  const [me, setMe] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const detail = await fetchComplaint(complaintId);
      setItem(detail);
      setStatus(detail.status);
      setPriority(detail.priority);
      setAssignee(detail.assignedToUserId ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    if (access.allowed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [access.allowed, load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMe(currentUserId());
  }, []);

  /**
   * Only the moves STATUS_TRANSITIONS allows, plus the current status itself so
   * the select has something to show. Anything else would be a 400 from the
   * backend, so it is never offered.
   */
  const statusOptions = useMemo<ComplaintStatus[]>(
    () =>
      item ? [item.status, ...ALLOWED_STATUS_TRANSITIONS[item.status]] : [],
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
          <BackLink href={returnTo}>Back to tickets</BackLink>
          {error && <ErrorBanner message={error} retry={load} />}
          {loading ? (
            <div
              className={`p-10 text-center text-[var(--text-secondary)] ${panelClass}`}
            >
              Loading ticket…
            </div>
          ) : (
            item && (
              <>
                <PageHeader
                  eyebrow="Support ticket"
                  title={`Ticket ${shortId(item.id)}`}
                  description={`${
                    item.bookingId
                      ? `Booking ${shortId(item.bookingId)}`
                      : "No booking attached"
                  } · opened ${dateTime(item.createdAt)}`}
                  action={
                    <div className="flex flex-wrap gap-2">
                      {item.humanRequested && (
                        <OpsBadge value="WANTS A HUMAN" kind="urgent" />
                      )}
                      <OpsBadge
                        value={item.priority}
                        kind={statusKind(item.priority)}
                      />
                      <OpsBadge
                        value={item.status}
                        kind={statusKind(item.status)}
                      />
                    </div>
                  }
                />

                {/* The customer asked for a real person. Nothing else on this
                    page outranks it, so it sits above every other panel. */}
                {item.humanRequested && (
                  <div className="mb-5 rounded-xl border border-[var(--urgent)] bg-[var(--urgent-soft)] p-4">
                    <p className="font-bold text-[var(--urgent)]">
                      This customer asked to speak to a person.
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Requested {dateTime(item.humanRequestedAt)}
                      {item.reporter ? ` · call ${item.reporter.phone}` : ""}
                    </p>
                  </div>
                )}

                <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
                  <div className="space-y-5">
                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="text-lg font-bold">The complaint</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.issueTypes.map((t) => (
                          <OpsBadge key={t} value={t} />
                        ))}
                      </div>
                      {item.otherText ? (
                        <p className="mt-4 rounded-xl bg-[var(--surface-subtle)] p-4 text-sm break-words whitespace-pre-wrap">
                          {item.otherText}
                        </p>
                      ) : (
                        <p className="mt-4 text-sm text-[var(--text-secondary)]">
                          The reporter did not write anything beyond the tags
                          above.
                        </p>
                      )}
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Fact label="Source" value={item.source} />
                        <Fact label="Created" value={dateTime(item.createdAt)} />
                        <Fact
                          label="Last activity"
                          value={dateTime(item.updatedAt)}
                        />
                        <Fact
                          label="Resolved"
                          value={
                            item.resolvedAt ? dateTime(item.resolvedAt) : "—"
                          }
                        />
                      </div>
                    </section>

                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="text-lg font-bold">Booking and people</h2>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Fact
                          label="Booking"
                          value={
                            item.booking ? shortId(item.booking.id) : "None"
                          }
                        />
                        <Fact
                          label="Booking status"
                          value={item.booking?.status ?? "—"}
                        />
                        <Fact
                          label="Booking title"
                          value={item.booking?.title ?? "—"}
                        />
                        <Fact
                          label="Reporter"
                          value={item.reporter?.phone ?? "Not signed in"}
                        />
                        <Fact
                          label="Reporter role"
                          value={item.reporter?.role ?? "—"}
                        />
                        <Fact
                          label="Ustaad reported"
                          value={
                            item.reportedWorker
                              ? `${item.reportedWorker.firstName} ${item.reportedWorker.lastName} · ${item.reportedWorker.user.phone}`
                              : "—"
                          }
                        />
                      </div>
                      {item.booking && (
                        <a
                          href={`/admin/bookings?search=${item.booking.id}`}
                          className={`mt-4 ${secondaryButtonClass}`}
                        >
                          Open this booking
                        </a>
                      )}
                    </section>

                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="text-lg font-bold">Ticket controls</h2>

                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                        <select
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as ComplaintStatus)
                          }
                          className={inputClass}
                        >
                          {statusOptions.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                        <button
                          disabled={saving || status === item.status || !status}
                          onClick={() =>
                            perform(() =>
                              changeComplaintStatus(
                                item.id,
                                status as ComplaintStatus,
                              ),
                            )
                          }
                          className={primaryButtonClass}
                        >
                          Change status
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        Only the moves the backend allows from{" "}
                        <strong>{item.status}</strong> are listed. Moving to
                        In Progress or Resolved also notifies the reporter.
                      </p>

                      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                        <select
                          value={priority}
                          onChange={(e) =>
                            setPriority(e.target.value as ComplaintPriority)
                          }
                          className={inputClass}
                        >
                          {COMPLAINT_PRIORITIES.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                        <button
                          disabled={
                            saving || priority === item.priority || !priority
                          }
                          onClick={() =>
                            perform(() =>
                              changeComplaintPriority(
                                item.id,
                                priority as ComplaintPriority,
                              ),
                            )
                          }
                          className={primaryButtonClass}
                        >
                          Change priority
                        </button>
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-5">
                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="font-bold">Owner</h2>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {item.assignedTo
                          ? `${item.assignedTo.phone} · ${item.assignedTo.role}`
                          : "Nobody owns this ticket yet."}
                      </p>
                      <input
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value.trim())}
                        placeholder="Admin user UUID"
                        className={`${inputClass} mt-3 w-full`}
                      />
                      <div className="mt-3 grid gap-2">
                        <button
                          disabled={
                            saving ||
                            !assignee ||
                            assignee === item.assignedToUserId
                          }
                          onClick={() =>
                            perform(() => assignComplaint(item.id, assignee))
                          }
                          className={primaryButtonClass}
                        >
                          <UserCheck className="h-4 w-4" />
                          Assign
                        </button>
                        {me && me !== item.assignedToUserId && (
                          <button
                            disabled={saving}
                            onClick={() =>
                              perform(() => assignComplaint(item.id, me))
                            }
                            className={secondaryButtonClass}
                          >
                            <UserCheck className="h-4 w-4" />
                            Assign to me
                          </button>
                        )}
                        {item.assignedToUserId && (
                          <button
                            disabled={saving}
                            onClick={() =>
                              perform(() => assignComplaint(item.id, null))
                            }
                            className={secondaryButtonClass}
                          >
                            <UserMinus className="h-4 w-4" />
                            Unassign
                          </button>
                        )}
                      </div>
                    </section>

                    <section className={`p-5 ${panelClass}`}>
                      <h2 className="font-bold">Human handover</h2>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {item.humanRequested
                          ? `Already flagged on ${dateTime(item.humanRequestedAt)}. The flag cannot be cleared.`
                          : "Flag this ticket when the customer asks for a real person on any channel."}
                      </p>
                      {!item.humanRequested && (
                        <button
                          disabled={saving}
                          onClick={() =>
                            perform(() => requestHumanOnComplaint(item.id))
                          }
                          className={`mt-3 w-full ${secondaryButtonClass}`}
                        >
                          <Hand className="h-4 w-4" />
                          Flag: wants a human
                        </button>
                      )}
                    </section>

                    <section className={`p-5 ${panelClass}`}>
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold">Activity</h2>
                        <button onClick={load} className="text-[var(--brand)]">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 space-y-4">
                        {item.events.length === 0 ? (
                          <p className="text-sm text-[var(--text-secondary)]">
                            No activity recorded.
                          </p>
                        ) : (
                          // The backend returns events oldest-first; newest-first
                          // reads better here, so the copy is reversed rather
                          // than the array mutated in place.
                          [...item.events].reverse().map((event) => (
                            <div
                              key={event.id}
                              className="border-l-2 border-[var(--border)] pl-3"
                            >
                              <p className="text-xs font-bold text-[var(--brand)]">
                                {event.type}
                              </p>
                              <p className="mt-1 text-sm break-words">
                                {event.actor
                                  ? `${event.actor.phone} · ${event.actor.role}`
                                  : "System"}
                                {event.notification ? " · notified" : ""}
                              </p>
                              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                {dateTime(event.createdAt)}
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
