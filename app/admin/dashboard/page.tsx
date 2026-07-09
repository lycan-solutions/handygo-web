"use client";

import Link from "next/link";
import {
  Users,
  CheckCircle,
  Clock,
  LayoutDashboard,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PendingWorker = {
  id: string;
};

const API_BASE_URL =
  "https://handygo-production-jqi9i.ondigitalocean.app/api/v1";

const AdminDashboardPage = () => {
  const router = useRouter();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("handygo_access_token");
    localStorage.removeItem("handygo_refresh_token");
    localStorage.removeItem("handygo_role");
    localStorage.removeItem("handygo_user");
    localStorage.removeItem("handygo_last_active");

    router.push("/auth/login");
  };

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
      const response = await fetch(`${API_BASE_URL}/admin/workers/pending`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Failed to load dashboard data.");
        return;
      }

      const workers: PendingWorker[] = data?.data || data || [];
      setPendingCount(workers.length);
    } catch (err) {
      console.log("Dashboard fetch error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--brand)] mb-2">
              <LayoutDashboard className="w-6 h-6" />
              <p className="font-semibold">Handygo Admin</p>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Manage Ustaads, bookings, users and platform operations.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 px-4 py-3 rounded-lg font-semibold shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
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
                  {loading ? "..." : pendingCount}
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
                <h2 className="text-3xl font-bold mt-1">—</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Stats API needed
                </p>
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
                <h2 className="text-3xl font-bold mt-1">—</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Stats API needed
                </p>
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
    </main>
  );
};

export default AdminDashboardPage;