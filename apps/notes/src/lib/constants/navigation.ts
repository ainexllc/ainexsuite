import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  StickyNote,
  Trash2,
  Users,
  Sparkles,
} from "lucide-react";
import { FocusIconNav } from "@/components/icons/focus-icon";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon | typeof FocusIconNav;
  badge?: string;
};

export const PRIMARY_NAV_ITEMS: AppNavItem[] = [
  { label: "Notes", href: "/workspace", icon: StickyNote },
  { label: "Reminders", href: "/reminders", icon: BellRing },
  { label: "Focus Mode", href: "/focus", icon: FocusIconNav },
  { label: "Shared", href: "/shared", icon: Users },
];

export const SECONDARY_NAV_ITEMS: AppNavItem[] = [
  { label: "Ideas Lab", href: "/ideas", icon: Sparkles, badge: "AI" },
  { label: "Trash", href: "/trash", icon: Trash2 },
];
