"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, ChevronsLeft, ChevronsRight, X, Wrench } from "lucide-react";
import { ADMIN_NAV_ITEMS, isNavItemActive } from "./nav-items";
import AdminNavItem from "./AdminNavItem";
import { clearAdminSession } from "@/lib/api/admin";

type AdminSidebarProps = {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  onClose?: () => void;
};

const AdminSidebar = ({
  collapsed,
  onToggleCollapse,
  variant = "desktop",
  onNavigate,
  onClose,
}: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = variant === "mobile";
  const isCollapsed = !isMobile && collapsed;

  const handleLogout = () => {
    clearAdminSession();
    onNavigate?.();
    router.push("/auth/login");
  };

  return (
    <div
      className={`flex h-full flex-col bg-[var(--surface)] ${isMobile ? "w-72" : "w-full"}`}
    >
      {/* Brand */}
      <div
        className={`flex items-center h-16 px-4 border-b border-[var(--border)] ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand)] flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight min-w-0">
              <p className="font-bold text-[var(--foreground)] truncate">
                HandyGo
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Admin navigation"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        {ADMIN_NAV_ITEMS.map((item) => (
          <AdminNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavItemActive(pathname, item.href)}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          aria-label="Logout"
          className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
          {isCollapsed && (
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
              Logout
            </span>
          )}
        </button>

        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="w-5 h-5" />
            ) : (
              <ChevronsLeft className="w-5 h-5" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
