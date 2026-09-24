import {
  LibraryBig,
  FileText,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Ticket,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Exact items match only their own route; subtree items match detail pages too. */
  exact?: boolean;
};

/** The focused build exposes only the active workspace tools. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/work-logs", label: "Work Logs", icon: NotebookPen },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/tracker", label: "Tracker", icon: ListChecks },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/resources", label: "Resources", icon: LibraryBig },
];

export const SECONDARY_NAV: NavItem[] = [];

export function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
