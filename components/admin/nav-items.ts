import type { LucideIcon } from "lucide-react";
import {
  Home,
  UserCheck,
  Users,
  Building2,
  LifeBuoy,
  UserMinus,
  KeyRound,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Home", href: "/admin/dashboard", icon: Home },
  { label: "Pending Ustaads", href: "/admin/ustaads", icon: UserCheck },
  { label: "Ustaads List", href: "/admin/ustaads-list", icon: Users },
  { label: "Clients List", href: "/admin/clients", icon: Building2 },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Delete User", href: "/admin/delete-user", icon: UserMinus },
  { label: "OTP Diagnostics", href: "/admin/otp", icon: KeyRound },
];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
