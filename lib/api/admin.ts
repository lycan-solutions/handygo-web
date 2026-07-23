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
  fullLegalName?: string | null;
  cnicNumber?: string | null;
  residentialAddress?: string | null;
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
