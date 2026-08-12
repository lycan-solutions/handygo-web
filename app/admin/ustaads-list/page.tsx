"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, RotateCcw, Users, ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchWorkers,
  fetchServiceCategories,
  WORKER_STATUSES,
  type WorkerListItem,
  type PaginationMeta,
  type ServiceCategory,
} from "@/lib/api/admin";
import StatusBadge from "@/components/admin/StatusBadge";
import AvatarThumb from "@/components/admin/AvatarThumb";

const PAGE_SIZE = 20;

const UstaadsListPage = () => {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  const [items, setItems] = useState<WorkerListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [onboardingStatus, setOnboardingStatus] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the free-text search before it drives a request. Resetting to
  // page 1 here (inside the timeout callback, not the effect body) is the
  // same "react to an external event" shape as the filter onChange handlers
  // below — not a derived-state-in-effect anti-pattern.
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

  useEffect(() => {
    if (!isAllowed) return;
    fetchServiceCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [isAllowed]);

  const loadWorkers = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchWorkers({
        search,
        status: status || undefined,
        categoryId: categoryId || undefined,
        onboardingStatus: onboardingStatus || undefined,
        verificationStatus: verificationStatus || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Ustaads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAllowed) return;
    // Data fetch synchronized to the current filters/page — the standard
    // effect use case, not the "derive state from state" anti-pattern this
    // lint rule otherwise guards against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed, search, status, categoryId, onboardingStatus, page]);

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

  const hasActiveFilters = Boolean(search || status || categoryId || onboardingStatus);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-[var(--brand)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ustaads List</h1>
              <p className="text-gray-600 mt-1">
                Browse, search, and manage every registered Ustaad account.
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
                placeholder="Search by name, phone, or CNIC number"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            <div className="grid grid-cols-2 lg:flex gap-3 lg:shrink-0">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Worker Status"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white"
              >
                <option value="">All Statuses</option>
                {WORKER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Skill"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white"
              >
                <option value="">All Skills</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={onboardingStatus}
                onChange={(e) => {
                  setOnboardingStatus(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Approval Status"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white col-span-2 lg:col-span-1"
              >
                <option value="">All Approval Stages</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED_FOR_REVIEW">Submitted for Review</option>
                <option value="CHANGES_REQUIRED">Changes Required</option>
                <option value="REJECTED">Rejected</option>
                <option value="APPROVED">Approved</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setStatus("");
                setCategoryId("");
                setOnboardingStatus("");
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
              onClick={loadWorkers}
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
            <p className="text-gray-500">Loading Ustaads...</p>
          </div>
        ) : !error && items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-gray-500">
              {hasActiveFilters ? "No Ustaads match your search/filters." : "No Ustaads found."}
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
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Ustaad</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Phone</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                        Primary Skill
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                        Worker Status
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Approval</th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Verification
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Joined
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((w) => (
                      <tr
                        key={w.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/admin/ustaads/${w.id}`)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <AvatarThumb
                              avatarUrl={w.avatarUrl}
                              firstName={w.firstName}
                              lastName={w.lastName}
                              size="sm"
                            />
                            <p className="font-semibold text-gray-900">
                              {w.firstName} {w.lastName}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{w.phone}</td>
                        <td className="px-5 py-3 text-gray-600">
                          {w.primarySkill ?? <span className="text-gray-400">No skill</span>}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge value={w.status} />
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge value={w.onboardingStatus} />
                        </td>
                        <td className="px-5 py-3 hidden lg:table-cell">
                          <StatusBadge value={w.verificationStatus} />
                        </td>
                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/ustaads/${w.id}`}
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
              {items.map((w) => (
                <Link
                  key={w.id}
                  href={`/admin/ustaads/${w.id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center gap-3">
                    <AvatarThumb
                      avatarUrl={w.avatarUrl}
                      firstName={w.firstName}
                      lastName={w.lastName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {w.firstName} {w.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{w.phone}</p>
                    </div>
                    <StatusBadge value={w.status} />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {w.primarySkill ?? <span className="text-gray-400">No skill</span>}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)]">
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
                  Page {meta.page} of {meta.totalPages} &middot; {meta.total} Ustaads
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

export default UstaadsListPage;
