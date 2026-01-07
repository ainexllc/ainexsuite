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
  Activity,
  Dumbbell,
  FolderKanban,
  Workflow,
  Calendar,
} from "lucide-react";
import { clsx } from "clsx";
import { NavigationSection } from "@ainexsuite/ui";
import { navigateToApp, getCurrentAppSlug } from "@ainexsuite/ui";

const apps = [
  { slug: 'main', icon: Home, label: 'Dashboard', color: '#f97316' },
  { slug: 'notes', icon: FileText, label: 'Notes', color: '#eab308' },
  { slug: 'journal', icon: BookOpen, label: 'Journal', color: '#f97316' },
  { slug: 'todo', icon: CheckSquare, label: 'Tasks', color: '#8b5cf6' },
  { slug: 'health', icon: Heart, label: 'Health', color: '#10b981' },
  { slug: 'album', icon: Camera, label: 'Album', color: '#ec4899' },
  { slug: 'habits', icon: Target, label: 'Habits', color: '#14b8a6' },
  { slug: 'hub', icon: Activity, label: 'Hub', color: '#ef4444' },
  { slug: 'fit', icon: Dumbbell, label: 'Fit', color: '#3b82f6' },
  { slug: 'projects', icon: FolderKanban, label: 'Projects', color: '#6366f1' },
  { slug: 'workflow', icon: Workflow, label: 'Workflow', color: '#06b6d4' },
  { slug: 'calendar', icon: Calendar, label: 'Calendar', color: '#06b6d4' },
];

type AppsSectionProps = {
  onClose: () => void;
};

export function AppsSection({ onClose }: AppsSectionProps) {
  const currentAppSlug = getCurrentAppSlug();

  const handleAppNavigation = useCallback((slug: string) => {
    onClose();
    navigateToApp(slug, currentAppSlug || 'main');
  }, [onClose, currentAppSlug]);

  return (
    <NavigationSection title="Apps">
      <div className="grid grid-cols-3 gap-2 px-2">
        {apps.map(({ slug, icon: Icon, label, color }) => {
          const isCurrentApp = slug === currentAppSlug;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleAppNavigation(slug)}
              disabled={isCurrentApp}
              className={clsx(
                "flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-all",
                isCurrentApp
                  ? "bg-ink-200 text-ink-900 cursor-default"
                  : "text-ink-500 hover:bg-surface-muted hover:text-ink-700 hover:scale-105",
              )}
            >
              <span
                className={clsx(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
                  isCurrentApp
                    ? "bg-ink-300/80 text-ink-900"
                    : "bg-surface-muted text-ink-600",
                )}
                style={{
                  backgroundColor: isCurrentApp ? undefined : `${color}20`,
                  color: isCurrentApp ? undefined : color
                }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={clsx(
                "truncate w-full text-center",
                isCurrentApp ? "text-ink-900" : "text-inherit"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </NavigationSection>
  );
}
