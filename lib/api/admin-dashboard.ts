import { adminFetch, type AdminStats } from "./admin";

/**
 * Dashboard counters.
 *
 * There is no aggregate stats endpoint for bookings, tickets or cases —
 * `/admin/stats` returns six Ustaad/user counts and nothing else
 * (backend `admin.repository.ts:234`). But every list endpoint already
 * returns `total` alongside its page, and every one of them accepts the
 * filters we care about. So each counter here is that list endpoint asked
 * for a single row: we throw the row away and keep the total.
 *
 * That costs one cheap query per card instead of one hand-written endpoint,
 * and it guarantees the number on a card and the list behind it can never
 * disagree — they are the same query. When a real aggregate endpoint exists,
 * this module is the only thing that has to change.
 */

/** Midnight this morning, in the viewer's own timezone, as an ISO instant. */
export function startOfToday(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

/** null means that one call failed — the card shows "—" instead of a wrong 0. */
export type DashboardCounts = {
  humanRequested: number | null;
  openTickets: number | null;
  openCases: number | null;
  pendingUstaads: number | null;
  bookingsToday: number | null;
  bookingsPending: number | null;
  bookingsInProgress: number | null;
  bookingsAwaitingConfirmation: number | null;
  bookingsTotal: number | null;
  bookingsCompleted: number | null;
  approvedUstaads: number | null;
  totalUsers: number | null;
};

/** Any list endpoint's envelope, reduced to the only field we want. */
async function total(path: string): Promise<number> {
  const result = await adminFetch<{ total: number }>(path);
  return result.total;
}

const one = "pageSize=1";

export async function fetchDashboardCounts(
  from: string,
): Promise<DashboardCounts> {
  const stats = adminFetch<AdminStats>("/admin/stats");

  const calls = [
    total(`/support/complaints?${one}&humanRequested=true`),
    total(`/support/complaints?${one}&status=OPEN`),
    total(`/admin/settlement-cases?${one}&status=OPEN`),
    stats.then((s) => s.pendingUstaads),
    total(`/admin/bookings?${one}&from=${encodeURIComponent(from)}`),
    total(`/admin/bookings?${one}&status=PENDING`),
    total(`/admin/bookings?${one}&status=IN_PROGRESS`),
    total(`/admin/bookings?${one}&status=AWAITING_CONFIRMATION`),
    total(`/admin/bookings?${one}`),
    total(`/admin/bookings?${one}&status=COMPLETED`),
    stats.then((s) => s.approvedUstaads),
    stats.then((s) => s.totalUsers),
  ] as const;

  // allSettled, not all: one dead endpoint must not blank out eleven working
  // cards. A rejected call becomes null and that card alone shows "—".
  const settled = await Promise.allSettled(calls);
  const [
    humanRequested,
    openTickets,
    openCases,
    pendingUstaads,
    bookingsToday,
    bookingsPending,
    bookingsInProgress,
    bookingsAwaitingConfirmation,
    bookingsTotal,
    bookingsCompleted,
    approvedUstaads,
    totalUsers,
  ] = settled.map((r) => (r.status === "fulfilled" ? r.value : null));

  return {
    humanRequested,
    openTickets,
    openCases,
    pendingUstaads,
    bookingsToday,
    bookingsPending,
    bookingsInProgress,
    bookingsAwaitingConfirmation,
    bookingsTotal,
    bookingsCompleted,
    approvedUstaads,
    totalUsers,
  };
}

/** True when every single call failed — worth showing a real error for. */
export function allCountsFailed(counts: DashboardCounts): boolean {
  return Object.values(counts).every((v) => v === null);
}
