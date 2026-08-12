"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type AdminNavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
};

const AdminNavItem = ({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: AdminNavItemProps) => {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
        active
          ? "bg-orange-50 text-[var(--brand)]"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 ${
          active ? "text-[var(--brand)]" : "text-gray-400 group-hover:text-gray-600"
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
          {label}
        </span>
      )}
    </Link>
  );
};

export default AdminNavItem;
