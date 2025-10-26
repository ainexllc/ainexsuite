import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  Archive,
  Clock8,
  StickyNote,
  Trash2,
  Users,
  Sparkles,
} from "lucide-react";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export const PRIMARY_NAV_ITEMS: AppNavItem[] = [
  { label: "Notes", href: "/workspace", icon: StickyNote },
  { label: "Reminders", href: "/reminders", icon: BellRing },
  { label: "Focus Mode", href: "/focus", icon: Clock8 },
  { label: "Shared", href: "/shared", icon: Users },
];

export const SECONDARY_NAV_ITEMS: AppNavItem[] = [
  { label: "Ideas Lab", href: "/ideas", icon: Sparkles, badge: "AI" },
  { label: "Archive", href: "/archive", icon: Archive },
  { label: "Trash", href: "/trash", icon: Trash2 },
];
