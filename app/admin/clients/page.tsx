"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, RotateCcw, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchClients,
  ACCOUNT_STATUSES,
  type ClientListItem,
  type PaginationMeta,
} from "@/lib/api/admin";
import StatusBadge from "@/components/admin/StatusBadge";
import AvatarThumb from "@/components/admin/AvatarThumb";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "NEWEST", label: "Newest First" },
  { value: "OLDEST", label: "Oldest First" },
  { value: "NAME", label: "Name (A-Z)" },
];

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const ClientsListPage = () => {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  const [items, setItems] = useState<ClientListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [phoneVerified, setPhoneVerified] = useState<"" | "VERIFIED" | "NOT_VERIFIED">("");
  const [sort, setSort] = useState<"NEWEST" | "OLDEST" | "NAME">("NEWEST");
  const [page, setPage] = useState(1);

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

  const loadClients = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchClients({
        search,
        accountStatus: accountStatus || undefined,
        phoneVerified: phoneVerified || undefined,
        sort,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAllowed) return;
    // Data fetch synchronized to the current filters/page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed, search, accountStatus, phoneVerified, sort, page]);

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

  const hasActiveFilters = Boolean(search || accountStatus || phoneVerified);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[var(--brand)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clients List</h1>
              <p className="text-gray-600 mt-1">
                Browse, search, and manage every registered Client account.
              </p>
            </div>
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
                placeholder="Search by name or phone (any format: 0345..., +92345...)"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:shrink-0">
              <select
                value={accountStatus}
                onChange={(e) => {
                  setAccountStatus(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Account Status"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white"
              >
                <option value="">All Statuses</option>
                {ACCOUNT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={phoneVerified}
                onChange={(e) => {
                  setPhoneVerified(e.target.value as "" | "VERIFIED" | "NOT_VERIFIED");
                  setPage(1);
                }}
                aria-label="Filter by Phone Verification"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white"
              >
                <option value="">All Phone Verification</option>
                <option value="VERIFIED">Verified</option>
                <option value="NOT_VERIFIED">Not Verified</option>
              </select>

              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as "NEWEST" | "OLDEST" | "NAME");
                  setPage(1);
                }}
                aria-label="Sort by"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white col-span-2 lg:col-span-1"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
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
                setAccountStatus("");
                setPhoneVerified("");
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
              onClick={loadClients}
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
            <p className="text-gray-500">Loading Clients...</p>
          </div>
        ) : !error && items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-gray-500">
              {hasActiveFilters ? "No Clients match your search/filters." : "No Clients found."}
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
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Client</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Phone</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                        Account Status
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Phone Verified
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Bookings</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Joined
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Last Activity
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/admin/clients/${c.id}`)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <AvatarThumb
                              avatarUrl={c.avatarUrl}
                              firstName={c.firstName}
                              lastName={c.lastName}
                              size="sm"
                            />
                            <p className="font-semibold text-gray-900">
                              {c.firstName} {c.lastName}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{c.phone}</td>
                        <td className="px-5 py-3">
                          <StatusBadge value={c.accountStatus} />
                        </td>
                        <td className="px-5 py-3 hidden lg:table-cell">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              c.phoneVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {c.phoneVerified ? "Verified" : "Not Verified"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{c.bookingsCount}</td>
                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                          {formatDate(c.lastActivityAt)}
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/clients/${c.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-3 py-2 rounded-lg text-sm font-semibold"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {items.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/clients/${c.id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center gap-3">
                    <AvatarThumb
                      avatarUrl={c.avatarUrl}
                      firstName={c.firstName}
                      lastName={c.lastName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{c.phone}</p>
                    </div>
                    <StatusBadge value={c.accountStatus} />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{c.bookingsCount} bookings</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--brand)]">
                      View Details <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Page {meta.page} of {meta.totalPages} &middot; {meta.total} Clients
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
    </div>
  );
};

export default ClientsListPage;
