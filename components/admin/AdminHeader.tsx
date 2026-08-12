"use client";

import { Menu } from "lucide-react";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 bg-white border-b border-gray-100 px-4 h-14">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open admin menu"
        className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
      >
        <Menu className="w-6 h-6" />
      </button>
      <p className="font-bold text-gray-900">HandyGo Admin</p>
    </header>
  );
};

export default AdminHeader;
