"use client";

import Link from "next/link";
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, type AdminStats } from "@/lib/api/admin";

const AdminDashboardPage = () => {
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("handygo_access_token");
    const role = localStorage.getItem("handygo_role");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (role !== "ADMIN") {
      setError("You are not authorized to access admin dashboard.");
      setLoading(false);
      return;
    }

    try {
      const data = await adminFetch<AdminStats>("/admin/stats");
      setStats(data);
    } catch (err) {
      console.log("Dashboard fetch error:", err);
      setError(err instanceof Error ? err.message : "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Manage Ustaads, bookings, users and platform operations.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Ustaads</p>
                <h2 className="text-3xl font-bold mt-1">
                  {loading ? "..." : stats?.pendingUstaads ?? "—"}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="text-[var(--brand)] w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved Ustaads</p>
                <h2 className="text-3xl font-bold mt-1">
                  {loading ? "..." : stats?.approvedUstaads ?? "—"}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <h2 className="text-3xl font-bold mt-1">
                  {loading ? "..." : stats?.totalUsers ?? "—"}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Ustaad Approvals
          </h2>

          <p className="text-gray-600 mt-2">
            Review newly registered Ustaads and approve or reject them before
            they start receiving jobs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/admin/ustaads"
              className="inline-flex justify-center bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-5 py-3 rounded-lg font-semibold"
            >
              Open Pending Ustaads
            </Link>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex justify-center bg-white border border-gray-200 text-gray-700 hover:border-[var(--brand)] hover:text-[var(--brand)] px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
