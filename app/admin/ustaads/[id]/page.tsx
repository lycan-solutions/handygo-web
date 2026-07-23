"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    LogOut,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ExternalLink,
    ImageOff,
    FileText,
    ShieldCheck,
    GraduationCap,
} from "lucide-react";
import {
    adminFetch,
    clearAdminSession,
    FACE_MATCH_STATUSES,
    TRAINING_STATUSES,
    type WorkerProfile,
    type WorkerAgreement,
} from "@/lib/api/admin";

type ReasonModalState = {
    type: "changes" | "reject";
    reason: string;
} | null;

const statusBadgeClasses = (status?: string | null) => {
    const value = (status || "").toUpperCase();

    if (["APPROVED", "COMPLETED", "MATCHED", "VERIFIED"].includes(value)) {
        return "bg-green-100 text-green-700";
    }
    if (["REJECTED", "NOT_MATCHED"].includes(value)) {
        return "bg-red-100 text-red-700";
    }
    if (["CHANGES_REQUIRED", "NEEDS_REVIEW", "NEEDS_RETRAINING", "INVITED"].includes(value)) {
        return "bg-amber-100 text-amber-700";
    }
    if (!value) {
        return "bg-gray-100 text-gray-600";
    }
    return "bg-yellow-100 text-yellow-700";
};

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
};

const AdminUstaadDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const workerId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    const [worker, setWorker] = useState<WorkerProfile | null>(null);
    const [agreements, setAgreements] = useState<WorkerAgreement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [actionLoading, setActionLoading] = useState<
        "" | "approve" | "changes" | "reject" | "facematch" | "training"
    >("");
    const [reasonModal, setReasonModal] = useState<ReasonModalState>(null);
    const [reasonError, setReasonError] = useState("");

    const handleLogout = () => {
        clearAdminSession();
        router.push("/auth/login");
    };

    const loadWorker = async () => {
        setLoading(true);
        setError("");

        try {
            const [workerData, agreementsData] = await Promise.all([
                adminFetch<WorkerProfile>(`/admin/workers/${workerId}`),
                adminFetch<WorkerAgreement[]>(`/admin/workers/${workerId}/agreements`),
            ]);

            setWorker(workerData);
            setAgreements(agreementsData || []);
        } catch (err) {
            console.log(err);
            setError(err instanceof Error ? err.message : "Failed to load Ustaad details.");
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

        if (workerId) {
            loadWorker();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, workerId]);

    const handleApprove = async () => {
        if (!confirm("Approve this Ustaad? They will be able to receive jobs.")) return;

        setActionLoading("approve");
        setError("");
        setSuccessMessage("");

        try {
            await adminFetch(`/admin/workers/${workerId}/approve`, { method: "PATCH" });
            setSuccessMessage("Ustaad approved successfully.");
            await loadWorker();
            setTimeout(() => router.push("/admin/ustaads"), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to approve Ustaad.");
        } finally {
            setActionLoading("");
        }
    };

    const openReasonModal = (type: "changes" | "reject") => {
        setReasonModal({ type, reason: "" });
        setReasonError("");
    };

    const closeReasonModal = () => {
        setReasonModal(null);
        setReasonError("");
    };

    const submitReasonModal = async () => {
        if (!reasonModal) return;

        const reason = reasonModal.reason.trim();
        if (!reason) {
            setReasonError("Reason is required.");
            return;
        }

        const endpoint =
            reasonModal.type === "changes"
                ? `/admin/workers/${workerId}/request-changes`
                : `/admin/workers/${workerId}/reject`;

        setActionLoading(reasonModal.type);
        setError("");
        setSuccessMessage("");

        try {
            await adminFetch(endpoint, {
                method: "PATCH",
                body: JSON.stringify({ reason }),
            });
            setSuccessMessage(
                reasonModal.type === "changes"
                    ? "Change request sent to the Ustaad."
                    : "Ustaad rejected."
            );
            closeReasonModal();
            await loadWorker();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed.");
        } finally {
            setActionLoading("");
        }
    };

    const handleFaceMatchChange = async (status: string) => {
        setActionLoading("facematch");
        setError("");
        setSuccessMessage("");

        try {
            await adminFetch(`/admin/workers/${workerId}/face-match`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            setSuccessMessage("Face match status updated.");
            await loadWorker();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update face match status.");
        } finally {
            setActionLoading("");
        }
    };

    const handleTrainingChange = async (status: string) => {
        setActionLoading("training");
        setError("");
        setSuccessMessage("");

        try {
            await adminFetch(`/admin/workers/${workerId}/training-status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            setSuccessMessage("Training status updated.");
            await loadWorker();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update training status.");
        } finally {
            setActionLoading("");
        }
    };

    if (checkingAuth) {
        return (
            <main className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
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
                <div className="max-w-6xl mx-auto">
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

    const generalAgreement = agreements.find((a) =>
        a.agreementType?.toLowerCase().includes("general")
    );
    const tradeAgreement = agreements.find((a) =>
        a.agreementType?.toLowerCase().includes("trade")
    );

    const documentCards = worker
        ? [
              { label: "CNIC Front", url: worker.cnicFrontUrl },
              { label: "CNIC Back", url: worker.cnicBackUrl },
              { label: "Live Selfie", url: worker.liveSelfieUrl },
          ]
        : [];

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/admin/ustaads"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Pending Ustaads
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-lg font-semibold shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
                        {successMessage}
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <p className="text-gray-500">Loading Ustaad details...</p>
                    </div>
                ) : !worker ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <p className="text-gray-500">Ustaad not found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {worker.firstName} {worker.lastName}
                                </h1>
                                <p className="text-gray-500 mt-1">{worker.phone}</p>
                            </div>

                            <span
                                className={`inline-flex w-fit items-center px-4 py-2 rounded-full text-sm font-bold ${statusBadgeClasses(
                                    worker.onboardingStatus
                                )}`}
                            >
                                {worker.onboardingStatus || "UNKNOWN"}
                            </span>
                        </div>

                        {/* Basic info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                <InfoField label="Full Legal Name" value={worker.fullLegalName} />
                                <InfoField label="CNIC Number" value={worker.cnicNumber} />
                                <InfoField label="Phone" value={worker.phone} />
                                <InfoField
                                    label="Main Skill"
                                    value={
                                        worker.skills?.length
                                            ? worker.skills.map((s) => s.category.name).join(", ")
                                            : "—"
                                    }
                                />
                                <InfoField
                                    label="Experience"
                                    value={
                                        worker.skills?.length
                                            ? `${worker.skills[0].yearsExperience} years`
                                            : "—"
                                    }
                                />
                                <InfoField label="Residential Address" value={worker.residentialAddress} />
                                <InfoField
                                    label="Submitted Date"
                                    value={formatDate(worker.submittedForReviewAt || worker.createdAt)}
                                />
                                <InfoField
                                    label="Account Status"
                                    badge
                                    value={worker.status}
                                />
                                <InfoField
                                    label="Verification Status"
                                    badge
                                    value={worker.verificationStatus}
                                />
                                <InfoField
                                    label="Face Match Status"
                                    badge
                                    value={worker.faceMatchStatus}
                                />
                                <InfoField
                                    label="Training Status"
                                    badge
                                    value={worker.trainingStatus}
                                />
                            </div>

                            {worker.changesRequiredReason && (
                                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
                                    <strong>Changes required reason:</strong> {worker.changesRequiredReason}
                                </div>
                            )}
                            {worker.rejectionReason && (
                                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
                                    <strong>Rejection reason:</strong> {worker.rejectionReason}
                                </div>
                            )}
                        </div>

                        {/* Documents */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Documents</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {documentCards.map((doc) => (
                                    <div
                                        key={doc.label}
                                        className="border border-gray-100 rounded-xl overflow-hidden"
                                    >
                                        <div className="h-48 bg-gray-50 flex items-center justify-center">
                                            {doc.url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={doc.url}
                                                    alt={doc.label}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <ImageOff className="w-8 h-8 mb-2" />
                                                    <span className="text-sm">Missing</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {doc.label}
                                            </span>
                                            {doc.url && (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
                                                >
                                                    Open <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Agreements */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Agreement PDFs</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AgreementCard
                                    title="General Agreement"
                                    agreement={generalAgreement}
                                />
                                <AgreementCard
                                    title="Trade-specific Agreement"
                                    agreement={tradeAgreement}
                                />
                            </div>
                        </div>

                        {/* Review controls */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Review Controls</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-gray-400" />
                                        Face Match Status
                                    </label>
                                    <select
                                        value={worker.faceMatchStatus || ""}
                                        onChange={(e) => handleFaceMatchChange(e.target.value)}
                                        disabled={actionLoading === "facematch"}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
                                    >
                                        <option value="" disabled>
                                            Select status
                                        </option>
                                        {FACE_MATCH_STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <GraduationCap className="w-4 h-4 text-gray-400" />
                                        Training Status
                                    </label>
                                    <select
                                        value={worker.trainingStatus || ""}
                                        onChange={(e) => handleTrainingChange(e.target.value)}
                                        disabled={actionLoading === "training"}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
                                    >
                                        <option value="" disabled>
                                            Select status
                                        </option>
                                        {TRAINING_STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Final actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Final Decision</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Use Request Changes for fixable issues. Use Reject only for serious
                                mismatch or fraud.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading !== ""}
                                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {actionLoading === "approve" ? "Approving..." : "Approve"}
                                </button>

                                <button
                                    onClick={() => openReasonModal("changes")}
                                    disabled={actionLoading !== ""}
                                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold"
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                    Request Changes
                                </button>

                                <button
                                    onClick={() => openReasonModal("reject")}
                                    disabled={actionLoading !== ""}
                                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reason modal */}
            {reasonModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            {reasonModal.type === "changes"
                                ? "Request Changes"
                                : "Reject Ustaad"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {reasonModal.type === "changes"
                                ? "Explain what the Ustaad needs to fix or resubmit."
                                : "Explain why this Ustaad application is being rejected."}
                        </p>

                        <textarea
                            value={reasonModal.reason}
                            onChange={(e) =>
                                setReasonModal((prev) =>
                                    prev ? { ...prev, reason: e.target.value } : prev
                                )
                            }
                            rows={4}
                            placeholder="e.g. CNIC front is blurry. Please upload a clear image."
                            className="mt-4 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                        />

                        {reasonError && (
                            <p className="mt-2 text-sm text-red-600">{reasonError}</p>
                        )}

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={closeReasonModal}
                                disabled={actionLoading !== ""}
                                className="px-4 py-2 rounded-lg font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReasonModal}
                                disabled={actionLoading !== ""}
                                className={`px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50 ${
                                    reasonModal.type === "reject"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-amber-500 hover:bg-amber-600"
                                }`}
                            >
                                {actionLoading === reasonModal.type ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

const InfoField = ({
    label,
    value,
    badge,
}: {
    label: string;
    value?: string | number | null;
    badge?: boolean;
}) => (
    <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        {badge ? (
            <span
                className={`inline-flex mt-1 items-center px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClasses(
                    value ? String(value) : null
                )}`}
            >
                {value || "—"}
            </span>
        ) : (
            <p className="text-gray-900 font-medium mt-1">{value ?? "—"}</p>
        )}
    </div>
);

const AgreementCard = ({
    title,
    agreement,
}: {
    title: string;
    agreement?: WorkerAgreement;
}) => (
    <div className="border border-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-900">{title}</span>
        </div>

        {agreement ? (
            <div className="space-y-1 text-sm text-gray-600">
                <p>{agreement.agreementTitle}</p>
                <p>Version: {agreement.agreementVersion}</p>
                <p>Accepted: {formatDate(agreement.acceptedAt)}</p>
                <a
                    href={agreement.acceptancePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
                >
                    Open PDF <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        ) : (
            <p className="text-sm text-gray-400">No agreement PDF found.</p>
        )}
    </div>
);

export default AdminUstaadDetailPage;
