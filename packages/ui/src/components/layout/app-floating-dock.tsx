"use client";

import { useCallback } from "react";
import {
  Home,
  FileText,
  BookOpen,
  CheckSquare,
  Heart,
  Camera,
  Target,
  LayoutGrid,
  Dumbbell,
  FolderKanban,
  Workflow,
  CreditCard,
  Table2,
  Calendar,
  FilePen,
} from "lucide-react";
import { FloatingDock, type FloatingDockItem } from "./floating-dock";
import { navigateToApp, getCurrentAppSlug } from "../../utils/cross-app-navigation";
import { cn } from "../../lib/utils";

const DOCK_APPS = [
  { slug: 'main', icon: Home, label: 'Dashboard', color: '#f97316' },
  { slug: 'notes', icon: FileText, label: 'Notes', color: '#eab308' },
  { slug: 'journal', icon: BookOpen, label: 'Journal', color: '#f97316' },
  { slug: 'todo', icon: CheckSquare, label: 'Tasks', color: '#8b5cf6' },
  { slug: 'health', icon: Heart, label: 'Health', color: '#10b981' },
  { slug: 'album', icon: Camera, label: 'Album', color: '#ec4899' },
  { slug: 'habits', icon: Target, label: 'Habits', color: '#14b8a6' },
  { slug: 'mosaic', icon: LayoutGrid, label: 'Mosaic', color: '#ef4444' },
  { slug: 'fit', icon: Dumbbell, label: 'Fit', color: '#3b82f6' },
  { slug: 'projects', icon: FolderKanban, label: 'Projects', color: '#6366f1' },
  { slug: 'flow', icon: Workflow, label: 'Flow', color: '#06b6d4' },
  { slug: 'docs', icon: FilePen, label: 'Docs', color: '#3b82f6' },
  { slug: 'subs', icon: CreditCard, label: 'Subs', color: '#22c55e' },
  { slug: 'tables', icon: Table2, label: 'Tables', color: '#8b5cf6' },
  { slug: 'calendar', icon: Calendar, label: 'Calendar', color: '#06b6d4' },
] as const;

interface AppFloatingDockProps {
  /** Current app slug for highlighting */
  currentApp?: string;
  /** Additional CSS class for the dock container */
  className?: string;
  /** Whether to hide the dock on mobile (default: true) */
  hideOnMobile?: boolean;
}

export function AppFloatingDock({
  currentApp,
  className,
  hideOnMobile = true,
}: AppFloatingDockProps) {
  const currentAppSlug = currentApp || getCurrentAppSlug();

  const handleAppNavigation = useCallback((slug: string) => {
    navigateToApp(slug, currentAppSlug || 'main');
  }, [currentAppSlug]);

  const items: FloatingDockItem[] = DOCK_APPS.map(({ slug, icon: Icon, label, color }) => ({
    title: label,
    icon: <Icon className="h-full w-full" />,
    onClick: () => handleAppNavigation(slug),
    color,
    isActive: slug === currentAppSlug,
  }));

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 overflow-visible",
        hideOnMobile && "hidden lg:block",
        className
      )}
      style={{ paddingTop: '60px', marginTop: '-60px' }}
    >
      <FloatingDock
        items={items}
        desktopClassName="backdrop-blur-xl"
      />
    </div>
  );
}
