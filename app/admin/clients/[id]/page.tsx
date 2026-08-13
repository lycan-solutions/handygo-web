"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Pencil,
    Save,
    X,
    ShieldAlert,
    CheckCircle2,
    ClipboardList,
} from "lucide-react";
import {
    fetchClientDetail,
    updateClientProfileFields,
    updateClientAccountStatus,
    ACCOUNT_STATUSES,
    type ClientDetail,
} from "@/lib/api/admin";
import StatusBadge from "@/components/admin/StatusBadge";
import AvatarThumb from "@/components/admin/AvatarThumb";

type EditForm = {
    firstName: string;
    lastName: string;
};

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
};

const buildForm = (client: ClientDetail): EditForm => ({
    firstName: client.firstName ?? "",
    lastName: client.lastName ?? "",
});

const AdminClientDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const clientId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    const [client, setClient] = useState<ClientDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Account status management
    const [pendingStatus, setPendingStatus] = useState("");
    const [statusModalTarget, setStatusModalTarget] = useState<string | null>(null);
    const [statusSaving, setStatusSaving] = useState(false);

    // Edit mode
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<EditForm | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    const loadClient = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchClientDetail(clientId);
            setClient(data);
            setPendingStatus(data.accountStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load Client details.");
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

        if (clientId) {
            loadClient();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, clientId]);

    const confirmStatusChange = async () => {
        if (!statusModalTarget || !client) return;
        setStatusSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            await updateClientAccountStatus(client.userId, statusModalTarget);
            setSuccessMessage(`Account status updated to ${statusModalTarget}.`);
            setStatusModalTarget(null);
            await loadClient();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update account status.");
        } finally {
            setStatusSaving(false);
        }
    };

    const startEdit = () => {
        if (!client) return;
        setForm(buildForm(client));
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
        if (!form) return;
        setSavingProfile(true);
        setError("");
        setSuccessMessage("");

        try {
            await updateClientProfileFields(clientId, {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
            });
            setSuccessMessage("Profile updated successfully.");
            setEditing(false);
            setForm(null);
            await loadClient();
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

    const statusChanged = client ? pendingStatus !== client.accountStatus : false;

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/admin/clients"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Clients List
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
                        <p className="text-gray-500">Loading Client details...</p>
                    </div>
                ) : !client ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <p className="text-gray-500">Client not found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <AvatarThumb
                                        avatarUrl={client.avatarUrl}
                                        firstName={client.firstName}
                                        lastName={client.lastName}
                                        size="lg"
                                    />
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                                {client.firstName} {client.lastName}
                                            </h1>
                                            <StatusBadge value={client.accountStatus} />
                                        </div>
                                        <p className="text-gray-500 mt-1">{client.phone}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            Joined {formatDate(client.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {!editing ? (
                                    <button
                                        onClick={startEdit}
                                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:border-[var(--brand)] hover:text-[var(--brand)] px-4 py-2.5 rounded-lg font-semibold shadow-sm shrink-0"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Details
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

                        {/* Account status */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                    Account Status
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        value={pendingStatus}
                                        onChange={(e) => setPendingStatus(e.target.value)}
                                        disabled={statusSaving}
                                        aria-label="Account Status"
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50 bg-white"
                                    >
                                        {ACCOUNT_STATUSES.map((s) => (
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
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>

                            {!editing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                    <InfoField label="First Name" value={client.firstName} />
                                    <InfoField label="Last Name" value={client.lastName} />
                                    <InfoField label="Registered Phone" value={client.phone} />
                                    <InfoField
                                        label="Phone Verified"
                                        value={client.phoneVerified ? "Verified" : "Not Verified"}
                                    />
                                    <InfoField
                                        label="Account Active"
                                        value={client.isActive ? "Yes" : "No"}
                                    />
                                    <InfoField label="Joined" value={formatDate(client.createdAt)} />
                                    <InfoField label="Last Updated" value={formatDate(client.updatedAt)} />
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
                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                Registered Phone
                                            </label>
                                            <p
                                                className="mt-1 w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500"
                                                title="Phone is the account's authentication identity and cannot be changed here."
                                            >
                                                {client.phone}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Booking Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <SummaryStat label="Total" value={client.bookingSummary.total} />
                                <SummaryStat
                                    label="Completed"
                                    value={client.bookingSummary.completed}
                                    accent="text-green-600"
                                />
                                <SummaryStat
                                    label="Active"
                                    value={client.bookingSummary.active}
                                    accent="text-blue-600"
                                />
                                <SummaryStat
                                    label="Cancelled"
                                    value={client.bookingSummary.cancelled}
                                    accent="text-red-600"
                                />
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h2>

                            {client.recentBookings.length === 0 ? (
                                <div className="text-center py-6">
                                    <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No bookings yet.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden sm:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="border-b border-gray-100">
                                                <tr>
                                                    <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        Service
                                                    </th>
                                                    <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        Status
                                                    </th>
                                                    <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        Ustaad
                                                    </th>
                                                    <th className="py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        Created
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {client.recentBookings.map((b) => (
                                                    <tr key={b.id} className="border-b border-gray-50 last:border-0">
                                                        <td className="py-3 pr-4 font-medium text-gray-900">
                                                            {b.categoryName}
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <StatusBadge value={b.status} />
                                                        </td>
                                                        <td className="py-3 pr-4 text-gray-600">
                                                            {b.workerName ?? (
                                                                <span className="text-gray-400">Not assigned</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-gray-600">{formatDate(b.createdAt)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile list */}
                                    <div className="sm:hidden space-y-3">
                                        {client.recentBookings.map((b) => (
                                            <div key={b.id} className="border border-gray-100 rounded-xl p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-medium text-gray-900">{b.categoryName}</p>
                                                    <StatusBadge value={b.status} />
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {b.workerName ?? "Not assigned"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">{formatDate(b.createdAt)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Account status confirmation modal */}
            {statusModalTarget && client && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-2">
                            {statusModalTarget === "SUSPENDED" ? (
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                            <h3 className="text-lg font-bold text-gray-900">
                                {statusModalTarget === "SUSPENDED" ? "Suspend Client?" : "Reactivate Client?"}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {statusModalTarget === "SUSPENDED"
                                ? "This client will be restricted from normal HandyGo activity until the account is reactivated."
                                : "This client's access will be restored to normal HandyGo activity."}
                        </p>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setStatusModalTarget(null);
                                    setPendingStatus(client.accountStatus);
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
                                        : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {statusSaving
                                    ? "Saving..."
                                    : statusModalTarget === "SUSPENDED"
                                    ? "Suspend Client"
                                    : "Reactivate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoField = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 font-medium mt-1 break-words">{value ?? "—"}</p>
    </div>
);

const EditInput = ({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) => (
    <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
    </div>
);

const SummaryStat = ({
    label,
    value,
    accent = "text-gray-900",
}: {
    label: string;
    value: number;
    accent?: string;
}) => (
    <div className="text-center bg-gray-50 rounded-xl py-4">
        <p className={`text-2xl font-bold ${accent}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
);

export default AdminClientDetailPage;
