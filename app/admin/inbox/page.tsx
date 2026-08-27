"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Search, Send } from "lucide-react";
import {
  fetchRequesterInfo,
  fetchSupportConversations,
  fetchSupportMessages,
  markSupportRead,
  sendSupportReply,
  type ChatMessage,
  type SupportConversation,
  type SupportRequesterInfo,
} from "@/lib/api/admin-support-chat";
import {
  AccessGate,
  ErrorBanner,
  OpsBadge,
  PageHeader,
  dateTime,
  inputClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  useAdminAccess,
} from "@/components/admin/operations/OperationsUi";

/**
 * The admin has no websocket of its own, so the inbox polls. The open thread
 * is what someone is actually watching, so it refreshes faster than the list.
 */
const MESSAGE_POLL_MS = 10_000;
const LIST_POLL_MS = 30_000;

/** Short, human time for a list row: "14:32" today, "12 Aug" before that. */
function listTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  return sameDay
    ? d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

export default function SupportInboxPage() {
  const access = useAdminAccess();

  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [requester, setRequester] = useState<SupportRequesterInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async (q: string) => {
    try {
      setConversations(await fetchSupportConversations(q));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the inbox.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(async (id: string, showSpinner: boolean) => {
    if (showSpinner) setLoadingThread(true);
    try {
      const [msgs, who] = await Promise.all([
        fetchSupportMessages(id),
        fetchRequesterInfo(id),
      ]);
      setMessages(msgs);
      setRequester(who);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the thread.");
    } finally {
      if (showSpinner) setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    if (!access.allowed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadList(search);
    const t = setInterval(() => void loadList(search), LIST_POLL_MS);
    return () => clearInterval(t);
  }, [access.allowed, search, loadList]);

  useEffect(() => {
    if (!activeId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadThread(activeId, true);
    const t = setInterval(() => void loadThread(activeId, false), MESSAGE_POLL_MS);
    return () => clearInterval(t);
  }, [activeId, loadThread]);

  // Opening a thread is what "reading" means, so the unread count clears here
  // rather than waiting for a reply that may never come.
  const openThread = async (id: string) => {
    setActiveId(id);
    setMessages([]);
    setRequester(null);
    setDraft("");
    try {
      await markSupportRead(id);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
      );
    } catch {
      // A failed read-marker must not stop the admin reading the thread.
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !activeId) return;
    setSending(true);
    setError("");
    try {
      await sendSupportReply(activeId, text);
      setDraft("");
      await loadThread(activeId, false);
      await loadList(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message not sent.");
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((n, c) => n + c.unreadCount, 0);

  return (
    <AccessGate {...access}>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
          <PageHeader
            eyebrow="Support"
            title="Inbox"
            description={
              totalUnread > 0
                ? `${totalUnread} message${totalUnread === 1 ? "" : "s"} waiting for a reply.`
                : "Live conversations with customers and Ustaads. Replies are sent as HandyGo Support."
            }
            action={
              <button
                onClick={() => void loadList(search)}
                className={secondaryButtonClass}
              >
                <RotateCcw className="h-4 w-4" />
                Refresh
              </button>
            }
          />

          {error && <ErrorBanner message={error} />}

          <div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
            {/* ── Threads ─────────────────────────────────────────────── */}
            <div className={`${panelClass} flex flex-col overflow-hidden`}>
              <div className="border-b border-[var(--border)] p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or phone"
                    className={`${inputClass} w-full pl-9`}
                  />
                </div>
              </div>

              <div className="max-h-[70vh] min-h-[420px] overflow-y-auto">
                {loadingList ? (
                  <p className="p-6 text-sm text-[var(--text-secondary)]">
                    Loading conversations…
                  </p>
                ) : conversations.length === 0 ? (
                  <p className="p-6 text-sm text-[var(--text-secondary)]">
                    {search
                      ? "Nobody matches that search."
                      : "No support conversations yet."}
                  </p>
                ) : (
                  conversations.map((c) => {
                    const active = c.id === activeId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => void openThread(c.id)}
                        className={`flex w-full gap-3 border-b border-[var(--border)] p-3 text-left ${
                          active
                            ? "bg-[var(--brand-light)]"
                            : "hover:bg-[var(--surface-subtle)]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate font-semibold text-[var(--foreground)]">
                              {c.requesterName}
                            </p>
                            <span className="shrink-0 text-xs text-[var(--text-secondary)] tabular-nums">
                              {listTime(c.lastMessageAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                            {c.lastMessagePreview ?? "No messages yet"}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <OpsBadge
                              value={c.requesterType === "WORKER" ? "USTAAD" : "CLIENT"}
                              kind={c.requesterType === "WORKER" ? "brand" : "neutral"}
                            />
                            {c.unreadCount > 0 && (
                              <span className="inline-flex min-w-5 justify-center rounded-full bg-[var(--urgent)] px-1.5 py-0.5 text-xs font-bold text-[var(--surface)] tabular-nums">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Thread ──────────────────────────────────────────────── */}
            <div className={`${panelClass} flex flex-col overflow-hidden`}>
              {!activeId ? (
                <p className="p-10 text-center text-sm text-[var(--text-secondary)]">
                  Pick a conversation to read it.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
                    <div>
                      <p className="font-bold text-[var(--foreground)]">
                        {requester?.name ?? "…"}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {requester ? (
                          <>
                            <a
                              href={`tel:${requester.phone}`}
                              className="font-semibold text-[var(--brand)]"
                            >
                              {requester.phone}
                            </a>
                            {" · joined "}
                            {dateTime(requester.memberSince)}
                          </>
                        ) : (
                          " "
                        )}
                      </p>
                    </div>
                    {requester && (
                      <OpsBadge
                        value={requester.role === "WORKER" ? "USTAAD" : requester.role}
                        kind={requester.role === "WORKER" ? "brand" : "neutral"}
                      />
                    )}
                  </div>

                  <div className="max-h-[56vh] min-h-[340px] flex-1 space-y-3 overflow-y-auto bg-[var(--surface-subtle)] p-4">
                    {loadingThread ? (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Loading messages…
                      </p>
                    ) : messages.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)]">
                        No messages in this thread yet.
                      </p>
                    ) : (
                      messages.map((m) => {
                        const fromSupport = m.senderRole === "ADMIN";
                        return (
                          <div
                            key={m.id}
                            className={`flex ${fromSupport ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                fromSupport
                                  ? "bg-[var(--brand)] text-[var(--background)]"
                                  : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                              }`}
                            >
                              {m.deletedAt ? (
                                <p className="text-sm italic opacity-70">
                                  Message deleted
                                </p>
                              ) : m.text ? (
                                <p className="text-sm break-words whitespace-pre-wrap">
                                  {m.text}
                                </p>
                              ) : (
                                // Images, voice notes and locations are sent from
                                // the app. The inbox says so plainly rather than
                                // rendering an empty bubble.
                                <p className="text-sm italic opacity-80">
                                  {m.type.toLowerCase()} attachment — open in the app
                                </p>
                              )}
                              <p className="mt-1 text-xs opacity-70 tabular-nums">
                                {listTime(m.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <div className="border-t border-[var(--border)] p-3">
                    <div className="flex gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          // Enter sends; Shift+Enter is a new line — the same
                          // thing every chat app does.
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void send();
                          }
                        }}
                        rows={2}
                        maxLength={4000}
                        placeholder="Reply as HandyGo Support…"
                        className={`${inputClass} flex-1 resize-none`}
                      />
                      <button
                        onClick={() => void send()}
                        disabled={sending || !draft.trim()}
                        className={primaryButtonClass}
                      >
                        <Send className="h-4 w-4" />
                        {sending ? "Sending…" : "Send"}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      Sent as <strong>HandyGo Support</strong>, not from your own
                      account, and it reaches their phone as a notification.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AccessGate>
  );
}
