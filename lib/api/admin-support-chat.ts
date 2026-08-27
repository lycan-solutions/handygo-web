import { adminFetch } from "./admin";

/**
 * Admin Support Inbox API.
 *
 * Field names and shapes come from the backend, not from guesswork:
 * `SupportConversationDto` / `SupportRequesterInfoDto` in
 * `chat/dto/support-conversation-response.dto.ts`, `MessageResponseDto` in
 * `chat/dto/message-response.dto.ts`, and the routes in
 * `chat/support.controller.ts`.
 *
 * These endpoints only ever touch support threads — the backend rejects any
 * conversation the support user is not part of — so an ordinary booking chat
 * between a client and an Ustaad can never be read here.
 */

export type SupportConversation = {
  id: string;
  requesterUserId: string;
  /** CLIENT or WORKER — support never messages itself. */
  requesterType: "CLIENT" | "WORKER";
  requesterName: string;
  requesterPhone: string;
  requesterAvatarUrl: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  /** Messages from the requester that support has not read yet. */
  unreadCount: number;
  createdAt: string;
};

export type SupportRequesterInfo = {
  userId: string;
  role: string;
  name: string;
  avatarUrl: string | null;
  phone: string;
  memberSince: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: string;
  type: string;
  text: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  mimeType: string | null;
  fileName: string | null;
  durationSeconds: number | null;
  latitude: number | null;
  longitude: number | null;
  editedAt: string | null;
  deletedAt: string | null;
  seenAt: string | null;
  createdAt: string;
};

/** Ordered by last activity, newest first. `take` is capped at 100 server-side. */
export function fetchSupportConversations(query?: string, take = 100) {
  const qs = new URLSearchParams({ take: String(take) });
  if (query?.trim()) qs.set("q", query.trim());
  return adminFetch<SupportConversation[]>(
    `/admin/support/conversations?${qs.toString()}`,
  );
}

export function fetchRequesterInfo(conversationId: string) {
  return adminFetch<SupportRequesterInfo>(
    `/admin/support/conversations/${conversationId}`,
  );
}

/**
 * The backend returns newest-first (`orderBy: createdAt desc`) because that is
 * what cursor pagination needs. A transcript reads oldest-first, so the caller
 * reverses — doing it here keeps that detail in one place.
 */
export async function fetchSupportMessages(
  conversationId: string,
  limit = 100,
) {
  const messages = await adminFetch<ChatMessage[]>(
    `/admin/support/conversations/${conversationId}/messages?limit=${limit}`,
  );
  return [...messages].reverse();
}

/** Sent as the shared "HandyGo Support" identity, never as the individual admin. */
export function sendSupportReply(conversationId: string, text: string) {
  return adminFetch<ChatMessage>(
    `/admin/support/conversations/${conversationId}/messages`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export function markSupportRead(conversationId: string) {
  return adminFetch<{ success: boolean; markedSeen: number }>(
    `/admin/support/conversations/${conversationId}/read`,
    { method: "POST" },
  );
}
