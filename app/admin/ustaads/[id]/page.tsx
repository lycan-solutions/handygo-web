"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ExternalLink,
    ImageOff,
    FileText,
    ShieldCheck,
    GraduationCap,
    Pencil,
    Save,
    X,
    ShieldAlert,
} from "lucide-react";
import {
    adminFetch,
    updateWorkerStatus,
    updateWorkerProfileFields,
    updateWorkerSkills,
    fetchServiceCategories,
    FACE_MATCH_STATUSES,
    TRAINING_STATUSES,
    WORKER_STATUSES,
    type WorkerProfile,
    type WorkerAgreement,
    type ServiceCategory,
} from "@/lib/api/admin";
import StatusBadge from "@/components/admin/StatusBadge";
import AvatarThumb from "@/components/admin/AvatarThumb";
import ImageLightbox from "@/components/admin/ImageLightbox";

type ReasonModalState = {
    type: "changes" | "reject";
    reason: string;
} | null;

type EditForm = {
    firstName: string;
    lastName: string;
    fullLegalName: string;
    cnicNumber: string;
    residentialAddress: string;
    fatherName: string;
    dateOfBirth: string;
    emergencyContact: string;
    categoryId: string;
    yearsExperience: string;
};

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
};

const buildForm = (worker: WorkerProfile): EditForm => ({
    firstName: worker.firstName ?? "",
    lastName: worker.lastName ?? "",
    fullLegalName: worker.fullLegalName ?? "",
    cnicNumber: worker.cnicNumber ?? "",
    residentialAddress: worker.residentialAddress ?? "",
    fatherName: worker.fatherName ?? "",
    dateOfBirth: worker.dateOfBirth ?? "",
    emergencyContact: worker.emergencyContact ?? "",
    categoryId: worker.skills?.[0]?.category.id ?? "",
    yearsExperience: worker.skills?.[0] ? String(worker.skills[0].yearsExperience) : "",
});

const AdminUstaadDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const workerId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    const [worker, setWorker] = useState<WorkerProfile | null>(null);
    const [agreements, setAgreements] = useState<WorkerAgreement[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [actionLoading, setActionLoading] = useState<
        "" | "approve" | "changes" | "reject" | "facematch" | "training"
    >("");
    const [reasonModal, setReasonModal] = useState<ReasonModalState>(null);
    const [reasonError, setReasonError] = useState("");

    // Worker Status management
    const [pendingStatus, setPendingStatus] = useState("");
    const [statusModalTarget, setStatusModalTarget] = useState<string | null>(null);
    const [statusSaving, setStatusSaving] = useState(false);

    // Edit mode
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<EditForm | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    // Document lightbox
    const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

    const loadWorker = async () => {
        setLoading(true);
        setError("");

        try {
            const [workerData, agreementsData] = await Promise.all([
                adminFetch<WorkerProfile>(`/admin/workers/${workerId}`),
                adminFetch<WorkerAgreement[]>(`/admin/workers/${workerId}/agreements`),
            ]);

            setWorker(workerData);
            setPendingStatus(workerData.status);
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
        fetchServiceCategories()
            .then(setCategories)
            .catch(() => setCategories([]));
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

    const confirmStatusChange = async () => {
        if (!statusModalTarget) return;
        setStatusSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const updated = await updateWorkerStatus(workerId, statusModalTarget);
            setWorker(updated);
            setPendingStatus(updated.status);
            setSuccessMessage(`Worker status updated to ${updated.status}.`);
            setStatusModalTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update worker status.");
        } finally {
            setStatusSaving(false);
        }
    };

    const startEdit = () => {
        if (!worker) return;
        setForm(buildForm(worker));
        setEditing(true);
        setError("");
        setSuccessMessage("");
    };

    const cancelEdit = () => {
        setEditing(false);
        setForm(null);
    };

    const updateField = (key: keyof EditForm, value: string) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const saveEdit = async () => {
        if (!form || !worker) return;
        setSavingProfile(true);
        setError("");
        setSuccessMessage("");

        try {
            await updateWorkerProfileFields(workerId, {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                fullLegalName: form.fullLegalName.trim() || undefined,
                cnicNumber: form.cnicNumber.trim() || undefined,
                residentialAddress: form.residentialAddress.trim() || undefined,
                fatherName: form.fatherName.trim() || undefined,
                dateOfBirth: form.dateOfBirth.trim() || undefined,
                emergencyContact: form.emergencyContact,
            });

            const originalCategoryId = worker.skills?.[0]?.category.id ?? "";
            const originalExperience = worker.skills?.[0]
                ? String(worker.skills[0].yearsExperience)
                : "";
            if (
                form.categoryId &&
                (form.categoryId !== originalCategoryId || form.yearsExperience !== originalExperience)
            ) {
                const years = form.yearsExperience.trim()
                    ? Number(form.yearsExperience)
                    : undefined;
                await updateWorkerSkills(
                    workerId,
                    [form.categoryId],
                    years !== undefined && !Number.isNaN(years) ? years : undefined
                );
            }

            setSuccessMessage("Profile updated successfully.");
            setEditing(false);
            setForm(null);
            await loadWorker();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save changes.");
        } finally {
            setSavingProfile(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
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
            </div>
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
              { label: "Profile Photo", url: worker.avatarUrl },
              { label: "Live Verification Selfie", url: worker.liveSelfieUrl },
              { label: "CNIC Front", url: worker.cnicFrontUrl },
              { label: "CNIC Back", url: worker.cnicBackUrl },
          ]
        : [];

    const statusChanged = worker ? pendingStatus !== worker.status : false;

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/admin/ustaads"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Pending Ustaads
                    </Link>
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <AvatarThumb
                                        avatarUrl={worker.avatarUrl}
                                        firstName={worker.firstName}
                                        lastName={worker.lastName}
                                        size="lg"
                                    />
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                            {worker.firstName} {worker.lastName}
                                        </h1>
                                        <p className="text-gray-500 mt-1">{worker.phone}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {worker.skills?.[0]?.category.name ?? "No skill set"} &middot; Joined{" "}
                                            {formatDate(worker.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {!editing ? (
                                    <button
                                        onClick={startEdit}
                                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:border-[var(--brand)] hover:text-[var(--brand)] px-4 py-2.5 rounded-lg font-semibold shadow-sm shrink-0"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={cancelEdit}
                                            disabled={savingProfile}
                                            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveEdit}
                                            disabled={savingProfile}
                                            className="inline-flex items-center justify-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {savingProfile ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status overview */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Status Overview</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                        Worker Status
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <select
                                            value={pendingStatus}
                                            onChange={(e) => setPendingStatus(e.target.value)}
                                            disabled={statusSaving}
                                            aria-label="Worker Status"
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50 bg-white"
                                        >
                                            {WORKER_STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                        {statusChanged && (
                                            <button
                                                onClick={() => setStatusModalTarget(pendingStatus)}
                                                disabled={statusSaving}
                                                className="inline-flex items-center gap-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                        Approval
                                    </p>
                                    <StatusBadge value={worker.onboardingStatus} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                        Verification
                                    </p>
                                    <StatusBadge value={worker.verificationStatus} />
                                </div>
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

                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>

                            {!editing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                    <InfoField label="First Name" value={worker.firstName} />
                                    <InfoField label="Last Name" value={worker.lastName} />
                                    <InfoField label="Full Legal Name" value={worker.fullLegalName} />
                                    <InfoField label="Registered Phone" value={worker.phone} />
                                    <InfoField label="CNIC Number" value={worker.cnicNumber} />
                                    <InfoField label="Father's Name" value={worker.fatherName} />
                                    <InfoField label="Date of Birth" value={worker.dateOfBirth} />
                                    <InfoField label="Address" value={worker.residentialAddress} />
                                    <InfoField label="Emergency Contact" value={worker.emergencyContact} />
                                </div>
                            ) : (
                                form && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <EditInput
                                            label="First Name"
                                            value={form.firstName}
                                            onChange={(v) => updateField("firstName", v)}
                                        />
                                        <EditInput
                                            label="Last Name"
                                            value={form.lastName}
                                            onChange={(v) => updateField("lastName", v)}
                                        />
                                        <EditInput
                                            label="Full Legal Name"
                                            value={form.fullLegalName}
                                            onChange={(v) => updateField("fullLegalName", v)}
                                        />
                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                Registered Phone
                                            </label>
                                            <p
                                                className="mt-1 w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500"
                                                title="Phone is the account's authentication identity and cannot be changed here."
                                            >
                                                {worker.phone}
                                            </p>
                                        </div>
                                        <EditInput
                                            label="CNIC Number"
                                            value={form.cnicNumber}
                                            onChange={(v) => updateField("cnicNumber", v)}
                                            placeholder="12345-1234567-1"
                                        />
                                        <EditInput
                                            label="Father's Name"
                                            value={form.fatherName}
                                            onChange={(v) => updateField("fatherName", v)}
                                        />
                                        <EditInput
                                            label="Date of Birth"
                                            type="date"
                                            value={form.dateOfBirth}
                                            onChange={(v) => updateField("dateOfBirth", v)}
                                        />
                                        <EditInput
                                            label="Address"
                                            value={form.residentialAddress}
                                            onChange={(v) => updateField("residentialAddress", v)}
                                            className="sm:col-span-2 lg:col-span-2"
                                        />
                                        <EditInput
                                            label="Emergency Contact"
                                            value={form.emergencyContact}
                                            onChange={(v) => updateField("emergencyContact", v)}
                                        />
                                    </div>
                                )
                            )}
                        </div>

                        {/* Professional Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Information</h2>

                            {!editing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                    <InfoField
                                        label="Primary Skill"
                                        value={worker.skills?.[0]?.category.name}
                                    />
                                    <InfoField
                                        label="Experience"
                                        value={
                                            worker.skills?.length
                                                ? `${worker.skills[0].yearsExperience} years`
                                                : undefined
                                        }
                                    />
                                </div>
                            ) : (
                                form && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                Primary Skill
                                            </label>
                                            <select
                                                value={form.categoryId}
                                                onChange={(e) => updateField("categoryId", e.target.value)}
                                                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-white"
                                            >
                                                <option value="">Select a skill</option>
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <EditInput
                                            label="Experience (years)"
                                            type="number"
                                            value={form.yearsExperience}
                                            onChange={(v) => updateField("yearsExperience", v)}
                                        />
                                    </div>
                                )
                            )}
                        </div>

                        {/* Verification / Documents */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Verification / Documents</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {documentCards.map((doc) => (
                                    <div
                                        key={doc.label}
                                        className="border border-gray-100 rounded-xl overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                doc.url && setLightbox({ url: doc.url, label: doc.label })
                                            }
                                            disabled={!doc.url}
                                            className="h-40 w-full bg-gray-50 flex items-center justify-center disabled:cursor-default"
                                        >
                                            {doc.url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={doc.url}
                                                    alt={doc.label}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <ImageOff className="w-8 h-8 mb-2" />
                                                    <span className="text-sm">Missing</span>
                                                </div>
                                            )}
                                        </button>
                                        <div className="p-3 flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {doc.label}
                                            </span>
                                            {doc.url && (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] shrink-0"
                                                >
                                                    Open <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                                <InfoField label="Worker Status" badge value={worker.status} />
                                <InfoField label="Approval Status" badge value={worker.onboardingStatus} />
                                <InfoField label="Verification Status" badge value={worker.verificationStatus} />
                                <InfoField label="Registration Date" value={formatDate(worker.createdAt)} />
                                <InfoField label="Last Updated" value={formatDate(worker.updatedAt)} />
                                <InfoField label="Face Match Status" badge value={worker.faceMatchStatus} />
                                <InfoField label="Training Status" badge value={worker.trainingStatus} />
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

            {/* Worker Status confirmation modal */}
            {statusModalTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-2">
                            {statusModalTarget === "SUSPENDED" && (
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            )}
                            <h3 className="text-lg font-bold text-gray-900">
                                {statusModalTarget === "SUSPENDED"
                                    ? "Suspend Ustaad?"
                                    : `Change status to ${statusModalTarget}?`}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {statusModalTarget === "SUSPENDED"
                                ? "This Ustaad will not be able to access the Worker app while suspended."
                                : `This Ustaad's worker status will be set to ${statusModalTarget}.`}
                        </p>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setStatusModalTarget(null);
                                    setPendingStatus(worker?.status ?? "");
                                }}
                                disabled={statusSaving}
                                className="px-4 py-2 rounded-lg font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                disabled={statusSaving}
                                className={`px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50 ${
                                    statusModalTarget === "SUSPENDED"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                                }`}
                            >
                                {statusSaving
                                    ? "Saving..."
                                    : statusModalTarget === "SUSPENDED"
                                    ? "Confirm Suspension"
                                    : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {lightbox && (
                <ImageLightbox
                    url={lightbox.url}
                    label={lightbox.label}
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
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
            <div className="mt-1">
                <StatusBadge value={value ? String(value) : null} />
            </div>
        ) : (
            <p className="text-gray-900 font-medium mt-1">{value ?? "—"}</p>
        )}
    </div>
);

const EditInput = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    className = "",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    className?: string;
}) => (
    <div className={className}>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
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
