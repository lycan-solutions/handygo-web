const API_BASE_URL = "https://handygo-production-jqi9i.ondigitalocean.app/api/v1";

export const ADMIN_API_BASE_URL = API_BASE_URL;

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("handygo_access_token");
}

export function getAdminRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("handygo_role");
}

export function clearAdminSession() {
  localStorage.removeItem("handygo_access_token");
  localStorage.removeItem("handygo_refresh_token");
  localStorage.removeItem("handygo_role");
  localStorage.removeItem("handygo_user");
  localStorage.removeItem("handygo_last_active");
}

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Wraps fetch with the admin auth header, JSON handling, and response.data
// unwrapping (backend always responds { success, data, message }).
export async function adminFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let json: { data?: T; message?: string } | null = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (response.status === 401) {
    clearAdminSession();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new AdminApiError(json?.message || "Session expired. Please login again.", 401);
  }

  if (!response.ok) {
    throw new AdminApiError(json?.message || "Request failed.", response.status);
  }

  return (json && "data" in json ? (json.data as T) : (json as T)) ?? (json as T);
}

export type WorkerSkill = {
  id: string;
  yearsExperience: number;
  category: { id: string; name: string };
};

export type WorkerDocument = {
  id: string;
  type: string;
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
};

export type WorkerProfile = {
  id: string;
  userId: string;
  phone: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  status: string;
  verificationStatus: string;
  skills: WorkerSkill[];
  documents: WorkerDocument[];
  createdAt: string;
  updatedAt: string;
  fullLegalName?: string | null;
  cnicNumber?: string | null;
  residentialAddress?: string | null;
  fatherName?: string | null;
  dateOfBirth?: string | null;
  emergencyContact?: string | null;
  cnicFrontUrl?: string | null;
  cnicBackUrl?: string | null;
  liveSelfieUrl?: string | null;
  faceMatchStatus?: string | null;
  trainingStatus?: string | null;
  onboardingStatus?: string | null;
  legalNameConfirmedAt?: string | null;
  generalAgreementAcceptedAt?: string | null;
  tradeAgreementAcceptedAt?: string | null;
  generalAgreementVersion?: string | null;
  tradeAgreementVersion?: string | null;
  submittedForReviewAt?: string | null;
  changesRequiredReason?: string | null;
  rejectionReason?: string | null;
};

// ── Ustaads List ────────────────────────────────────────────────────────────

export type WorkerListItem = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string | null;
  primarySkill: string | null;
  status: string;
  onboardingStatus: string;
  verificationStatus: string;
  createdAt: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedWorkers = {
  items: WorkerListItem[];
  meta: PaginationMeta;
};

export type ServiceCategory = {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
};

export type ListWorkersParams = {
  search?: string;
  status?: string;
  onboardingStatus?: string;
  verificationStatus?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
};

export async function fetchWorkers(params: ListWorkersParams): Promise<PaginatedWorkers> {
  const qs = new URLSearchParams();
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.status) qs.set("status", params.status);
  if (params.onboardingStatus) qs.set("onboardingStatus", params.onboardingStatus);
  if (params.verificationStatus) qs.set("verificationStatus", params.verificationStatus);
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 20));

  return adminFetch<PaginatedWorkers>(`/admin/workers?${qs.toString()}`);
}

/** GET /categories is public (no admin auth required) but shares the same base URL/JSON envelope. */
export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  return adminFetch<ServiceCategory[]>(`/categories`);
}

export async function updateWorkerStatus(
  workerProfileId: string,
  status: string
): Promise<WorkerProfile> {
  return adminFetch<WorkerProfile>(`/admin/workers/${workerProfileId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export type UpdateWorkerProfileFields = Partial<{
  firstName: string;
  lastName: string;
  fullLegalName: string;
  cnicNumber: string;
  residentialAddress: string;
  fatherName: string;
  dateOfBirth: string;
  emergencyContact: string;
}>;

export async function updateWorkerProfileFields(
  workerProfileId: string,
  data: UpdateWorkerProfileFields
): Promise<WorkerProfile> {
  return adminFetch<WorkerProfile>(`/admin/workers/${workerProfileId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateWorkerSkills(
  workerProfileId: string,
  categoryIds: string[],
  yearsExperience?: number
): Promise<WorkerProfile> {
  return adminFetch<WorkerProfile>(`/admin/workers/${workerProfileId}/skills`, {
    method: "PATCH",
    body: JSON.stringify({
      categoryIds,
      ...(yearsExperience !== undefined ? { yearsExperience } : {}),
    }),
  });
}

export const WORKER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

export type WorkerAgreement = {
  id: string;
  agreementType: string;
  agreementTitle: string;
  agreementVersion: string;
  acceptedAt: string;
  acceptancePdfUrl: string;
  createdAt: string;
};

export type AdminStats = {
  pendingUstaads: number;
  approvedUstaads: number;
  rejectedUstaads: number;
  changesRequiredUstaads: number;
  totalWorkers: number;
  totalUsers: number;
};

export const FACE_MATCH_STATUSES = [
  "PENDING",
  "MATCHED",
  "NOT_MATCHED",
  "NEEDS_REVIEW",
] as const;

export const TRAINING_STATUSES = [
  "NOT_STARTED",
  "INVITED",
  "COMPLETED",
  "NEEDS_RETRAINING",
] as const;
