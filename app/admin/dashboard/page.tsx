"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  fetchDashboardCounts,
  startOfToday,
  type DashboardCounts,
} from "@/lib/api/admin-dashboard";
import {
  AccessGate,
  ErrorBanner,
  PageHeader,
  panelClass,
  secondaryButtonClass,
  useAdminAccess,
} from "@/components/admin/operations/OperationsUi";

/**
 * Every card is a link into the list it counts, carrying the same filter.
 * A number an admin cannot act on is decoration; "12 open tickets" is only
 * useful if clicking it shows those twelve.
 */
type Card = {
  label: string;
  value: number | null;
  href: string;
  hint?: string;
  /** Turns urgent once there is actually something waiting on a person. */
  urgentWhenNonZero?: boolean;
};

export default function AdminDashboardPage() {
  const access = useAdminAccess();
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /** Empty until the first load, so "today" is recomputed on every Refresh
      instead of freezing on a tab left open past midnight. */
  const [from, setFrom] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const today = startOfToday();
    setFrom(today);
    try {
      setCounts(await fetchDashboardCounts(today));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load counts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (access.allowed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [access.allowed, load]);

  const c = counts;
  const encodedFrom = encodeURIComponent(from);

  const attention: Card[] = [
    {
      label: "Asked for a human",
      value: c?.humanRequested ?? null,
      href: "/admin/support?humanRequested=true",
      hint: "A customer is waiting to speak to a person",
      urgentWhenNonZero: true,
    },
    {
      label: "Open tickets",
      value: c?.openTickets ?? null,
      href: "/admin/support?status=OPEN",
      hint: "Complaints nobody has picked up",
    },
    {
      label: "Open cases",
      value: c?.openCases ?? null,
      href: "/admin/cases?status=OPEN",
      hint: "Settlement exceptions",
    },
    {
      label: "Ustaads awaiting approval",
      value: c?.pendingUstaads ?? null,
      href: "/admin/ustaads",
      hint: "Submitted for review",
    },
  ];

  const bookings: Card[] = [
    {
      label: "Booked today",
      value: c?.bookingsToday ?? null,
      href: from ? `/admin/bookings?from=${encodedFrom}` : "/admin/bookings",
      hint: "Created since midnight",
    },
    {
      label: "Waiting for an Ustaad",
      value: c?.bookingsPending ?? null,
      href: "/admin/bookings?status=PENDING",
      hint: "Nobody has accepted yet",
    },
    {
      label: "Work in progress",
      value: c?.bookingsInProgress ?? null,
      href: "/admin/bookings?status=IN_PROGRESS",
      hint: "An Ustaad is on the job",
    },
    {
      label: "Awaiting confirmation",
      value: c?.bookingsAwaitingConfirmation ?? null,
      href: "/admin/bookings?status=AWAITING_CONFIRMATION",
      hint: "Waiting on the customer",
    },
  ];

  const totals: Card[] = [
    {
      label: "Bookings, all time",
      value: c?.bookingsTotal ?? null,
      href: "/admin/bookings",
    },
    {
      label: "Completed",
      value: c?.bookingsCompleted ?? null,
      href: "/admin/bookings?status=COMPLETED",
    },
    {
      label: "Approved Ustaads",
      value: c?.approvedUstaads ?? null,
      href: "/admin/ustaads-list",
    },
    {
      label: "Registered users",
      value: c?.totalUsers ?? null,
      href: "/admin/clients",
    },
  ];

  return (
    <AccessGate {...access}>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1400px]">
          <PageHeader
            eyebrow="Overview"
            title="Dashboard"
            description="Live counts straight from the lists behind them. Click any number to open it."
            action={
              <button
                onClick={load}
                disabled={loading}
                className={secondaryButtonClass}
              >
                <RotateCcw className="h-4 w-4" />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            }
          />

          {error && <ErrorBanner message={error} retry={load} />}

          <Section title="Needs attention" cards={attention} loading={loading} />
          <Section title="Bookings" cards={bookings} loading={loading} />
          <Section title="Totals" cards={totals} loading={loading} />

          {/* Said plainly rather than left as a gap someone has to notice:
              money and app installs are not in this database at all. */}
          <p className="mt-6 text-sm text-[var(--text-secondary)]">
            Revenue and commission totals are not shown here — no endpoint
            aggregates them yet. App install counts live in the Play Console,
            not in this database.
          </p>
        </div>
      </div>
    </AccessGate>
  );
}

function Section({
  title,
  cards,
  loading,
}: {
  title: string;
  cards: Card[];
  loading: boolean;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-xs font-bold tracking-[0.16em] text-[var(--text-secondary)] uppercase">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <CountCard key={card.label} card={card} loading={loading} />
        ))}
      </div>
    </section>
  );
}

function CountCard({ card, loading }: { card: Card; loading: boolean }) {
  const urgent = Boolean(card.urgentWhenNonZero && card.value);
  return (
    <Link
      href={card.href}
      className={`block p-5 transition-colors hover:border-[var(--brand)] ${
        urgent
          ? "rounded-2xl border border-[var(--urgent)] bg-[var(--urgent-soft)]"
          : panelClass
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          urgent ? "text-[var(--urgent)]" : "text-[var(--text-secondary)]"
        }`}
      >
        {card.label}
      </p>
      <p
        className={`mt-2 text-4xl font-bold tabular-nums ${
          urgent ? "text-[var(--urgent)]" : "text-[var(--foreground)]"
        }`}
      >
        {loading ? "…" : (card.value ?? "—")}
      </p>
      {card.hint && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">{card.hint}</p>
      )}
    </Link>
  );
}
