import { adminFetch } from "./admin";

/**
 * Support ticket (Complaint) API.
 *
 * Every constant and every field name below is copied from the backend, not
 * invented: the enums come from `prisma/schema.prisma`, the query shape from
 * `dto/support-complaint.dto.ts`, the row shape from `complaintDetailInclude`
 * in `complaints.repository.ts`, and ALLOWED_STATUS_TRANSITIONS from
 * `STATUS_TRANSITIONS` in `complaints.service.ts`. If the backend changes, this
 * file is what has to change with it.
 */

export const COMPLAINT_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_CUSTOMER",
  "RESOLVED",
  "CLOSED",
] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const COMPLAINT_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
] as const;
export type ComplaintPriority = (typeof COMPLAINT_PRIORITIES)[number];

export const COMPLAINT_SOURCES = [
  "APP_CUSTOMER",
  "APP_WORKER",
  "WEBSITE_BOT",
  "WHATSAPP_BOT",
  "EMAIL",
  "ADMIN",
] as const;

export const COMPLAINT_ISSUE_TYPES = [
  "WORK_QUALITY",
  "PRICE_PAYMENT",
  "USTAAD_BEHAVIOUR",
  "DAMAGE",
  "PART_MATERIAL",
  "WARRANTY_REWORK",
  "OTHER",
] as const;

export const COMPLAINT_EVENT_TYPES = [
  "CREATED",
  "STATUS_CHANGED",
  "ASSIGNED",
  "PRIORITY_CHANGED",
  "HUMAN_REQUESTED",
  "RESOLVED",
  "REOPENED",
] as const;

/**
 * Mirrors STATUS_TRANSITIONS in complaints.service.ts. The UI offers only these
 * moves so an admin can never pick an option the backend will reject with 400.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  ComplaintStatus,
  readonly ComplaintStatus[]
> = {
  OPEN: ["IN_PROGRESS", "WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"],
  IN_PROGRESS: ["WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"],
  WAITING_ON_CUSTOMER: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
  RESOLVED: ["OPEN", "IN_PROGRESS", "CLOSED"],
  CLOSED: ["OPEN", "IN_PROGRESS"],
};

export type ComplaintActor = { id: string; phone: string; role: string };

export type ComplaintEvent = {
  id: string;
  complaintId: string;
  type: string;
  actorUserId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: ComplaintActor | null;
  /** Present when this event also pushed a notification to the reporter. */
  notification: { id: string } | null;
};

export type ComplaintBooking = {
  id: string;
  title: string | null;
  status: string;
  clientProfileId: string;
  workerProfileId: string | null;
};

export type ComplaintWorker = {
  id: string;
  firstName: string;
  lastName: string;
  user: { id: string; phone: string };
};

export type Complaint = {
  id: string;
  /** Null for future non-booking channels (website bot, WhatsApp, email). */
  bookingId: string | null;
  /** Null for an unauthenticated report — there is then nobody to call back. */
  reporterUserId: string | null;
  reportedWorkerProfileId: string | null;
  issueTypes: string[];
  otherText: string | null;
  source: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedToUserId: string | null;
  humanRequested: boolean;
  humanRequestedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking: ComplaintBooking | null;
  reporter: ComplaintActor | null;
  reportedWorker: ComplaintWorker | null;
  assignedTo: ComplaintActor | null;
  events: ComplaintEvent[];
};

export type PagedComplaints = {
  items: Complaint[];
  total: number;
  page: number;
  pageSize: number;
};

export type ComplaintQuery = {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  assignedToUserId?: string;
  humanRequested?: boolean;
  page?: number;
  pageSize?: number;
};

function queryString(values: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

export function fetchComplaints(params: ComplaintQuery) {
  return adminFetch<PagedComplaints>(
    `/support/complaints?${queryString(params)}`,
  );
}

export function fetchComplaint(id: string) {
  return adminFetch<Complaint>(`/support/complaints/${id}`);
}

export function changeComplaintStatus(id: string, status: ComplaintStatus) {
  return adminFetch<Complaint>(`/support/complaints/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function changeComplaintPriority(
  id: string,
  priority: ComplaintPriority,
) {
  return adminFetch<Complaint>(`/support/complaints/${id}/priority`, {
    method: "PATCH",
    body: JSON.stringify({ priority }),
  });
}

/** Pass null to unassign — the DTO accepts `string | null`, not undefined. */
export function assignComplaint(id: string, assignedToUserId: string | null) {
  return adminFetch<Complaint>(`/support/complaints/${id}/assignment`, {
    method: "PATCH",
    body: JSON.stringify({ assignedToUserId }),
  });
}

export function requestHumanOnComplaint(id: string) {
  return adminFetch<Complaint>(`/support/complaints/${id}/human-request`, {
    method: "POST",
  });
}
