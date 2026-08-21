import { adminFetch } from "./admin";

export const BOOKING_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "EN_ROUTE",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
  "AWAITING_CONFIRMATION",
  "SETTLED",
] as const;
export const BOOKING_LANES = ["STANDARD", "INSPECTION", "BIDDING"] as const;
export const CASE_TYPES = ["SHORT", "UNPAID_LABOUR", "UNPAID_FEE"] as const;
export const CASE_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;
export const CASE_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export const COLLECTION_STATUSES = [
  "PENDING",
  "COLLECTED",
  "FAILED",
  "CANCELLED",
] as const;
export const CONTACT_CHANNELS = [
  "PHONE",
  "SMS",
  "WHATSAPP",
  "EMAIL",
  "OTHER",
] as const;
export const CONTACT_OUTCOMES = [
  "REACHED",
  "NO_ANSWER",
  "PROMISED_PAYMENT",
  "DISPUTED",
  "WRONG_NUMBER",
  "OTHER",
] as const;
export const SETTLEMENT_SOURCES = ["USTAAD", "CLIENT", "ADMIN"] as const;

export type UserSummary = { id?: string; phone: string };
export type ProfileSummary = {
  id: string;
  firstName: string;
  lastName: string;
  user: UserSummary;
};
export type Settlement = {
  id: string;
  bookingId: string;
  workerProfileId: string;
  supersedesId: string | null;
  supersededBy: { id: string } | null;
  isCurrent: boolean;
  collectionItems?: { id: string }[];
  expectedParts: number;
  expectedLabour: number;
  expectedFee: number;
  expectedTotal: number;
  received: number;
  source: "OTP" | "USTAAD" | "CLIENT" | "ADMIN";
  partsPaid: number;
  labourPaid: number;
  feePaid: number;
  commission: number;
  munafa: number;
  shortfall: number;
  handygoPays: number;
  note: string | null;
  settledByUserId: string;
  settledAt: string;
};
export type AdminBooking = {
  id: string;
  title: string | null;
  description: string;
  status: string;
  lane: string;
  createdAt: string;
  scheduledAt: string | null;
  completedAt: string | null;
  finalPrice: number | null;
  paymentStatus: string;
  commissionStatus: string;
  commissionStatusUpdatedAt: string | null;
  clientProfile: ProfileSummary;
  workerProfile: ProfileSummary | null;
  category: { id: string; name: string };
  settlements: Settlement[];
};
export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
export type BookingQuery = {
  search?: string;
  status?: string;
  lane?: string;
  workerProfileId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

function queryString(values: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

export function fetchAdminBookings(params: BookingQuery) {
  return adminFetch<Paged<AdminBooking>>(
    `/admin/bookings?${queryString(params)}`,
  );
}
export function fetchAdminBooking(id: string) {
  return adminFetch<AdminBooking>(`/admin/bookings/${id}`);
}
export type SettlementWrite = {
  received: number;
  source: (typeof SETTLEMENT_SOURCES)[number];
  note?: string;
};
export function createBookingSettlement(
  bookingId: string,
  data: SettlementWrite,
) {
  return adminFetch<Settlement>(`/admin/bookings/${bookingId}/settlements`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function correctBookingSettlement(
  bookingId: string,
  data: SettlementWrite & { supersedesId: string },
) {
  return adminFetch<Settlement>(
    `/admin/bookings/${bookingId}/settlements/corrections`,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export type CaseActor = { id: string; phone: string };
export type CaseEvent = {
  id: string;
  type: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: CaseActor;
};
export type CaseNote = {
  id: string;
  body: string;
  createdAt: string;
  author: CaseActor;
};
export type ContactAttempt = {
  id: string;
  channel: string;
  outcome: string;
  note: string | null;
  followUpAt: string | null;
  contactedAt: string;
  actor: CaseActor;
};
export type SettlementCase = {
  id: string;
  bookingId: string;
  workerProfileId: string;
  settlementId: string;
  type: string;
  status: string;
  priority: string;
  assignedToUserId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking: { id: string; title: string | null; status: string; lane: string };
  workerProfile: ProfileSummary;
  settlement: Settlement;
  assignedTo: CaseActor | null;
  events: CaseEvent[];
  notes: CaseNote[];
  contactAttempts: ContactAttempt[];
};
export type CaseQuery = {
  status?: string;
  type?: string;
  priority?: string;
  assignedToUserId?: string;
  workerProfileId?: string;
  page?: number;
  pageSize?: number;
};
export function fetchSettlementCases(params: CaseQuery) {
  return adminFetch<Paged<SettlementCase>>(
    `/admin/settlement-cases?${queryString(params)}`,
  );
}
export function fetchSettlementCase(id: string) {
  return adminFetch<SettlementCase>(`/admin/settlement-cases/${id}`);
}
export function updateSettlementCase(
  id: string,
  data: { status?: string; priority?: string; assignedToUserId?: string },
) {
  return adminFetch<SettlementCase>(`/admin/settlement-cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export function addCaseNote(id: string, body: string) {
  return adminFetch<CaseNote>(`/admin/settlement-cases/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
export function addContactAttempt(
  id: string,
  data: {
    channel: string;
    outcome: string;
    note?: string;
    followUpAt?: string;
  },
) {
  return adminFetch<ContactAttempt>(
    `/admin/settlement-cases/${id}/contact-attempts`,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export type CommissionCollectionItem = {
  id: string;
  amount: number;
  settlementId: string;
  settlement: Settlement;
};
export type CommissionCollection = {
  id: string;
  workerProfileId: string;
  collectionDate: string;
  amount: number;
  status: string;
  collectedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  workerProfile: ProfileSummary;
  items: CommissionCollectionItem[];
};
export type CollectionQuery = {
  status?: string;
  workerProfileId?: string;
  collectionDate?: string;
  page?: number;
  pageSize?: number;
};
export function fetchCommissionCollections(params: CollectionQuery) {
  return adminFetch<Paged<CommissionCollection>>(
    `/admin/commission-collections?${queryString(params)}`,
  );
}
export type NightlyGenerationResult = {
  collectionDate: string;
  workerCount: number;
  totalAmount: number;
  collections: Array<{
    id: string;
    workerProfileId: string;
    amount: number;
    status: string;
  }>;
};
export function generateNightlyCommission(collectionDate?: string) {
  return adminFetch<NightlyGenerationResult>(
    "/admin/commission-collections/nightly",
    {
      method: "POST",
      body: JSON.stringify(collectionDate ? { collectionDate } : {}),
    },
  );
}
export function updateCommissionCollection(
  id: string,
  status: "COLLECTED" | "FAILED",
  failureReason?: string,
) {
  return adminFetch<CommissionCollection>(
    `/admin/commission-collections/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(failureReason ? { failureReason } : {}),
      }),
    },
  );
}
