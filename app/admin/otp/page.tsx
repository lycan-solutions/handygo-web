"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RotateCcw,
  RefreshCw,
  KeyRound,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchOtpRecords,
  OTP_PURPOSES,
  OTP_STATUSES,
  type OtpListItem,
  type PaginationMeta,
} from "@/lib/api/admin";
import StatusBadge from "@/components/admin/StatusBadge";
import RevealOtpModal from "@/components/admin/RevealOtpModal";

const PAGE_SIZE = 20;

const TIME_RANGES = [
  { label: "Last 30 minutes", minutes: 30 },
  { label: "Last 1 hour", minutes: 60 },
  { label: "Last 4 hours", minutes: 240 },
  { label: "Last 24 hours", minutes: 1440 },
];

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const OtpDiagnosticsPage = () => {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  const [items, setItems] = useState<OtpListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState("");
  const [sinceMinutes, setSinceMinutes] = useState(60);
  const [page, setPage] = useState(1);

  const [revealTarget, setRevealTarget] = useState<{ id: string; phone: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const token = localStorage.getItem("handygo_access_token");
    const role = localStorage.getItem("handygo_role");

    if (!token) {
      router.push("/auth/login");
      return;
    }
    if (role !== "ADMIN") {
      setIsAllowed(false);
      setCheckingAuth(false);
      setLoading(false);
      return;
    }

    setIsAllowed(true);
    setCheckingAuth(false);
  }, [router]);

  const loadOtps = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchOtpRecords({
        search,
        purpose: purpose || undefined,
        status: status || undefined,
        sinceMinutes,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load OTP records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAllowed) return;
    // Data fetch synchronized to the current filters/page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOtps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed, search, purpose, status, sinceMinutes, page]);

  if (checkingAuth) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-gray-500">Checking access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Not authorized</h1>
            <p className="text-gray-500 mt-2">Only admin users can access this page.</p>
            <Link
              href="/auth/login"
              className="inline-flex mt-6 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-5 py-3 rounded-lg font-semibold"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Boolean(search || purpose || status);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6 text-[var(--brand)]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">OTP Diagnostics</h1>
                <p className="text-gray-600 mt-1">
                  Inspect recent OTP activity. Revealing a code is audited and only ever done
                  explicitly.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadOtps}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:border-[var(--brand)] hover:text-[var(--brand)] px-4 py-2.5 rounded-lg font-semibold shadow-sm disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by phone (any format: 0310..., +92310..., 92310...)"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:shrink-0">
              <select
                value={purpose}
                onChange={(e) => {
                  setPurpose(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Purpose"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white"
              >
                <option value="">All Purposes</option>
                {OTP_PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Status"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white"
              >
                <option value="">All Statuses</option>
                {OTP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={sinceMinutes}
                onChange={(e) => {
                  setSinceMinutes(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Filter by time range"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white col-span-2 lg:col-span-1"
              >
                {TIME_RANGES.map((r) => (
                  <option key={r.minutes} value={r.minutes}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPurpose("");
                setStatus("");
                setPage(1);
              }}
              className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-gray-500 hover:text-[var(--brand)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between gap-3 text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={loadOtps}
              className="inline-flex items-center gap-1 shrink-0 bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-gray-500">Loading OTP records...</p>
          </div>
        ) : !error && items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-gray-500">
              {hasActiveFilters
                ? "No OTP records match your search/filters."
                : "No OTP records in this time range."}
            </p>
          </div>
        ) : !error ? (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Phone</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Purpose</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Created
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Expires
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Attempts
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">SMS</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">OTP</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3 font-semibold text-gray-900">{r.phone}</td>
                        <td className="px-5 py-3 text-gray-600">{r.purpose}</td>
                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                          {formatDateTime(r.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                          {formatDateTime(r.expiresAt)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge value={r.status} />
                        </td>
                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                          {r.attempts}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              r.smsStatus === "DISPATCHED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {r.smsStatus === "DISPATCHED" ? "Dispatched" : "Not Sent"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 font-mono tracking-widest">
                          &bull;&bull;&bull;&bull;&bull;&bull;
                        </td>
                        <td className="px-5 py-3">
                          {r.revealable ? (
                            <button
                              type="button"
                              onClick={() => setRevealTarget({ id: r.id, phone: r.phone })}
                              className="inline-flex items-center gap-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-3 py-2 rounded-lg text-sm font-semibold"
                            >
                              <Eye className="w-4 h-4" />
                              Reveal
                            </button>
                          ) : (
                            <span className="text-gray-300 text-sm">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {items.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900">{r.phone}</p>
                    <StatusBadge value={r.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{r.purpose}</p>
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p>Created: {formatDateTime(r.createdAt)}</p>
                    <p>Expires: {formatDateTime(r.expiresAt)}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        r.smsStatus === "DISPATCHED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.smsStatus === "DISPATCHED" ? "Dispatched" : "Not Sent"}
                    </span>

                    {r.revealable ? (
                      <button
                        type="button"
                        onClick={() => setRevealTarget({ id: r.id, phone: r.phone })}
                        className="inline-flex items-center gap-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-3 py-2 rounded-lg text-sm font-semibold"
                      >
                        <Eye className="w-4 h-4" />
                        Reveal OTP
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm font-mono tracking-widest">
                        &bull;&bull;&bull;&bull;&bull;&bull;
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Page {meta.page} of {meta.totalPages} &middot; {meta.total} records
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={meta.page <= 1}
                    aria-label="Previous page"
                    className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={meta.page >= meta.totalPages}
                    aria-label="Next page"
                    className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {revealTarget && (
        <RevealOtpModal
          otpId={revealTarget.id}
          phone={revealTarget.phone}
          onClose={() => setRevealTarget(null)}
        />
      )}
    </div>
  );
};

export default OtpDiagnosticsPage;
