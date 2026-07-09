"use client";

import Link from "next/link";
import { ArrowLeft, Check, X, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
type PendingWorker = {
    id: string;
    userId: string;
    phone: string;
    firstName: string;
    lastName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    status: string;
    verificationStatus: string;
    skills: {
        id: string;
        yearsExperience: number;
        category: {
            id: string;
            name: string;
        };
    }[];
    documents: {
        id: string;
        type: string;
        fileUrl: string;
        fileName?: string | null;
        mimeType?: string | null;
        verifiedAt?: string | null;
        createdAt: string;
    }[];
    createdAt: string;
};

const API_BASE_URL =
    "https://handygo-production-jqi9i.ondigitalocean.app/api/v1";

const AdminUstaadsPage = () => {
    const router = useRouter();

    const [pendingWorkers, setPendingWorkers] = useState<PendingWorker[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState("");
    const handleLogout = () => {
        localStorage.removeItem("handygo_access_token");
        localStorage.removeItem("handygo_refresh_token");
        localStorage.removeItem("handygo_role");
        localStorage.removeItem("handygo_user");
        localStorage.removeItem("handygo_last_active");

        router.push("/auth/login");
    };
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
        fetchPendingWorkers(token);
    }, [router]);

    const safeJson = async (response: Response) => {
        try {
            return await response.json();
        } catch {
            return null;
        }
    };

    const fetchPendingWorkers = async (tokenFromEffect?: string) => {
        setLoading(true);
        setError("");

        const token =
            tokenFromEffect || localStorage.getItem("handygo_access_token");

        if (!token) {
            setError("Please login again.");
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

            const data = await safeJson(response);

            if (!response.ok) {
                setError(data?.message || "Failed to load pending Ustaads.");
                return;
            }

            setPendingWorkers(data?.data || data || []);
        } catch (err) {
            console.log(err);
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        const token = localStorage.getItem("handygo_access_token");

        if (!token) {
            setError("Please login again.");
            return;
        }

        setActionLoadingId(id);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/workers/${id}/approve`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await safeJson(response);

            if (!response.ok) {
                setError(data?.message || "Failed to approve Ustaad.");
                return;
            }

            setPendingWorkers((prev) => prev.filter((worker) => worker.id !== id));
        } catch (err) {
            console.log(err);
            setError("Server error. Please try again.");
        } finally {
            setActionLoadingId("");
        }
    };

    const handleReject = async (id: string) => {
        const confirmReject = confirm("Are you sure you want to reject this Ustaad?");

        if (!confirmReject) return;

        const token = localStorage.getItem("handygo_access_token");

        if (!token) {
            setError("Please login again.");
            return;
        }

        setActionLoadingId(id);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/workers/${id}/reject`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await safeJson(response);

            if (!response.ok) {
                setError(data?.message || "Failed to reject Ustaad.");
                return;
            }

            setPendingWorkers((prev) => prev.filter((worker) => worker.id !== id));
        } catch (err) {
            console.log(err);
            setError("Server error. Please try again.");
        } finally {
            setActionLoadingId("");
        }
    };

    if (checkingAuth) {
        return (
            <main className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <p className="text-gray-500">Checking access...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!isAllowed) {
        return (
            <main className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Not authorized</h1>
                        <p className="text-gray-500 mt-2">
                            Only admin users can access this page.
                        </p>

                        <Link
                            href="/auth/login"
                            className="inline-flex mt-6 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-lg font-semibold shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-[var(--brand)]" />
                        </div>

                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Pending Ustaads
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Approve or reject newly registered Handygo Ustaads.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <p className="text-gray-500">Loading pending Ustaads...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                Approval Requests
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {pendingWorkers.length} Ustaads waiting for approval
                            </p>
                        </div>

                        {pendingWorkers.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-gray-500">No pending Ustaads found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Name
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Phone
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Skills
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Documents
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Status
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Registered
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {pendingWorkers.map((worker) => (
                                            <tr
                                                key={worker.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {worker.firstName} {worker.lastName}
                                                    </p>
                                                    {worker.bio && (
                                                        <p className="text-xs text-gray-500 mt-1 max-w-[220px] truncate">
                                                            {worker.bio}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {worker.phone}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {worker.skills.length > 0 ? (
                                                            worker.skills.map((skill) => (
                                                                <span
                                                                    key={skill.id}
                                                                    className="bg-orange-50 text-[var(--brand)] text-xs font-semibold px-3 py-1 rounded-full"
                                                                >
                                                                    {skill.category.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">
                                                                No skills
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {worker.documents?.length || 0} documents
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                                                        {worker.verificationStatus}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {new Date(worker.createdAt).toLocaleDateString()}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApprove(worker.id)}
                                                            disabled={actionLoadingId === worker.id}
                                                            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            {actionLoadingId === worker.id
                                                                ? "Approving..."
                                                                : "Approve"}
                                                        </button>

                                                        <button
                                                            onClick={() => handleReject(worker.id)}
                                                            disabled={actionLoadingId === worker.id}
                                                            className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            {actionLoadingId === worker.id
                                                                ? "Rejecting..."
                                                                : "Reject"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default AdminUstaadsPage;