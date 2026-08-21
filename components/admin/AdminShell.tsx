"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const COLLAPSE_STORAGE_KEY = "handygo_admin_sidebar_collapsed";

const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage on mount; kept as an effect (not a lazy
    // initializer) so server and client render the same markup on hydration.
    const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "1") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] md:flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-[var(--border)] transition-[width] duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="sticky top-0 h-screen">
          <AdminSidebar
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            variant="desktop"
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            className="absolute inset-0 bg-black/50 cursor-default"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">
            <AdminSidebar
              collapsed={false}
              variant="mobile"
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;
