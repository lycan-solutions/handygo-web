"use client";

import Link from "next/link";
import { ArrowLeft, UserCheck, LogOut, FileText, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, clearAdminSession, type WorkerProfile } from "@/lib/api/admin";

const AdminUstaadsPage = () => {
    const router = useRouter();

    const [pendingWorkers, setPendingWorkers] = useState<WorkerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = () => {
        clearAdminSession();
        router.push("/auth/login");
    };

    const fetchPendingWorkers = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await adminFetch<WorkerProfile[]>("/admin/workers/pending");
            setPendingWorkers(data || []);
        } catch (err) {
            console.log(err);
            setError(err instanceof Error ? err.message : "Failed to load pending Ustaads.");
        } finally {
            setLoading(false);
        }
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
        fetchPendingWorkers();
    }, [router]);

    const documentCount = (worker: WorkerProfile) => {
        const docs = [worker.cnicFrontUrl, worker.cnicBackUrl, worker.liveSelfieUrl];
        return docs.filter(Boolean).length;
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
                                Review submitted documents and agreements before approving or
                                rejecting newly registered Handygo Ustaads.
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
                                                Main Skill
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                CNIC Number
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Documents
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Status
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Submitted Date
                                            </th>
                                            <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                                                Action
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
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {worker.phone}
                                                </td>

                                                <td className="px-5 py-4">
                                                    {worker.skills?.length > 0 ? (
                                                        <span className="bg-orange-50 text-[var(--brand)] text-xs font-semibold px-3 py-1 rounded-full">
                                                            {worker.skills[0].category.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">
                                                            No skill
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {worker.cnicNumber || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        {documentCount(worker)} / 3 documents
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                                                        {worker.onboardingStatus || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {new Date(
                                                        worker.submittedForReviewAt || worker.createdAt
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <Link
                                                        href={`/admin/ustaads/${worker.id}`}
                                                        className="inline-flex items-center gap-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </Link>
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
