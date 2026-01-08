"use client";

import { useCallback } from "react";
import { FloatingDock, type FloatingDockItem } from "./floating-dock";
import { navigateToApp, getCurrentAppSlug } from "../../utils/cross-app-navigation";
import { debouncedPrefetch, cancelPrefetch } from "../../utils/app-prefetch";
import { cn } from "../../lib/utils";
import {
  MainDashboardIcon,
  NotesStickyIcon,
  JourneyJournalIcon,
  TodoTargetIcon,
  HealthActivityIcon,
  MomentsCameraIcon,
  GrowHabitIcon,
  PulseAmbientIcon,
  FitCaloriesIcon,
  ProjectsTimelineIcon,
  WorkflowProcessIcon,
  DocsDocumentIcon,
  SubsWalletIcon,
  CalendarWeekIcon,
} from "../ai";

// Animated icon props type
interface AnimatedIconProps {
  size?: number;
  color?: string;
  isAnimating?: boolean;
}

// Map app slugs to their animated icons
const ANIMATED_ICONS: Record<string, React.ComponentType<AnimatedIconProps>> = {
  main: MainDashboardIcon,
  notes: NotesStickyIcon,
  journal: JourneyJournalIcon,
  todo: TodoTargetIcon,
  health: HealthActivityIcon,
  album: MomentsCameraIcon,
  habits: GrowHabitIcon,
  mosaic: PulseAmbientIcon,
  fit: FitCaloriesIcon,
  projects: ProjectsTimelineIcon,
  flow: WorkflowProcessIcon,
  docs: DocsDocumentIcon,
  subs: SubsWalletIcon,
  tables: ProjectsTimelineIcon, // Reuse Projects icon for Tables
  calendar: CalendarWeekIcon,
};

const DOCK_APPS = [
  { slug: 'main', label: 'Dashboard', color: '#f97316' },
  { slug: 'notes', label: 'Notes', color: '#eab308' },
  { slug: 'journal', label: 'Journal', color: '#f97316' },
  { slug: 'todo', label: 'Todos', color: '#8b5cf6' },
  { slug: 'health', label: 'Health', color: '#10b981' },
  { slug: 'album', label: 'Album', color: '#ec4899' },
  { slug: 'habits', label: 'Habits', color: '#14b8a6' },
  { slug: 'mosaic', label: 'Mosaic', color: '#ef4444' },
  { slug: 'fit', label: 'Fit', color: '#3b82f6' },
  { slug: 'projects', label: 'Projects', color: '#6366f1' },
  { slug: 'flow', label: 'Flow', color: '#06b6d4' },
  { slug: 'docs', label: 'Docs', color: '#3b82f6' },
  { slug: 'subs', label: 'Subs', color: '#22c55e' },
  { slug: 'tables', label: 'Tables', color: '#8b5cf6' },
  { slug: 'calendar', label: 'Calendar', color: '#06b6d4' },
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

  const items: FloatingDockItem[] = DOCK_APPS.map(({ slug, label, color }) => {
    const AnimatedIcon = ANIMATED_ICONS[slug];
    return {
      title: label,
      icon: <AnimatedIcon size={24} color={color} isAnimating={true} />,
      onClick: () => handleAppNavigation(slug),
      onHoverStart: () => debouncedPrefetch(slug),
      onHoverEnd: () => cancelPrefetch(slug),
      color,
      isActive: slug === currentAppSlug,
    };
  });

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
