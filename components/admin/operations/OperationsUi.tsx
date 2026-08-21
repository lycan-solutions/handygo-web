"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export const panelClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--surface)]";
export const inputClass =
  "rounded-xl border border-[var(--control-border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand)]";
export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--background)] hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--control-border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50";

export function useAdminAccess() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("handygo_access_token");
    const role = localStorage.getItem("handygo_role");
    if (!token) router.replace("/auth/login");
    // Existing admin session state is intentionally synchronized on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setAllowed(role === "ADMIN");
    setChecking(false);
  }, [router]);
  return { checking, allowed };
}

export function AccessGate({
  checking,
  allowed,
  children,
}: {
  checking: boolean;
  allowed: boolean;
  children: React.ReactNode;
}) {
  if (checking) return <PageState title="Checking access…" />;
  if (!allowed)
    return (
      <PageState
        title="Not authorized"
        detail="Only admin users can access operations."
      />
    );
  return children;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[var(--foreground)]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function PageState({
  title,
  detail,
  retry,
}: {
  title: string;
  detail?: string;
  retry?: () => void;
}) {
  return (
    <div className="p-4 md:p-8">
      <div className={`mx-auto max-w-7xl p-10 text-center ${panelClass}`}>
        <p className="font-semibold text-[var(--foreground)]">{title}</p>
        {detail && (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{detail}</p>
        )}
        {retry && (
          <button
            type="button"
            onClick={retry}
            className={`mt-4 ${secondaryButtonClass}`}
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorBanner({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[var(--error)] bg-[var(--surface)] p-4 text-[var(--error)]">
      <span className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        {message}
      </span>
      {retry && (
        <button onClick={retry} className={secondaryButtonClass}>
          Retry
        </button>
      )}
    </div>
  );
}

const label = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
export function OpsBadge({
  value,
  kind = "neutral",
}: {
  value: string;
  kind?: "neutral" | "success" | "warning" | "urgent" | "brand";
}) {
  const styles = {
    neutral: "bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
    success: "bg-[var(--brand-light)] text-[var(--success)]",
    warning: "bg-[var(--warning-surface)] text-[var(--warning)]",
    urgent: "bg-[var(--urgent-soft)] text-[var(--urgent)]",
    brand: "bg-[var(--brand-light)] text-[var(--brand)]",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${styles[kind]}`}
    >
      {label(value)}
    </span>
  );
}
export function statusKind(
  value: string,
): "neutral" | "success" | "warning" | "urgent" | "brand" {
  if (
    [
      "SETTLED",
      "PAID",
      "COLLECTED",
      "RESOLVED",
      "CLOSED",
      "COMPLETED",
    ].includes(value)
  )
    return "success";
  if (
    ["URGENT", "FAILED", "SHORT", "UNPAID_LABOUR", "UNPAID_FEE"].includes(value)
  )
    return "urgent";
  if (["PENDING", "AWAITING_CONFIRMATION", "OPEN", "HIGH"].includes(value))
    return "warning";
  if (["IN_PROGRESS", "ADMIN"].includes(value)) return "brand";
  return "neutral";
}

export const money = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "—"
    : `PKR ${new Intl.NumberFormat("en-PK").format(value)}`;
export const dateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("en-PK") : "—";
export const shortId = (value: string) => value.slice(0, 8).toUpperCase();

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className={`mt-5 flex items-center justify-between p-3 ${panelClass}`}>
      <p className="text-sm text-[var(--text-secondary)]">
        Page {page} of {pages} · {total} records
      </p>
      <div className="flex gap-2">
        <button
          className={secondaryButtonClass}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          className={secondaryButtonClass}
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)]"
    >
      <ChevronLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}
