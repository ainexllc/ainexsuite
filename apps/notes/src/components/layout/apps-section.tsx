"use client";

import { useCallback } from "react";
import {
  Home,
  BookOpen,
  CheckSquare,
  Camera,
  GraduationCap,
  Activity as ActivityIcon,
  Dumbbell,
} from "lucide-react";
import { clsx } from "clsx";
import { NavigationSection, NotesStickyIcon } from "@ainexsuite/ui";
import { navigateToApp, getCurrentAppSlug } from "@ainexsuite/ui";

// Wrapper to make animated icon compatible with lucide-style rendering
const NotesAnimatedIcon = ({ className }: { className?: string }) => (
  <NotesStickyIcon size={16} color="currentColor" isAnimating={true} className={className} />
);

const apps = [
  { slug: 'main', icon: Home, label: 'Dashboard' },
  { slug: 'notes', icon: NotesAnimatedIcon, label: 'Notes' },
  { slug: 'journey', icon: BookOpen, label: 'Journey' },
  { slug: 'todo', icon: CheckSquare, label: 'Tasks' },
  { slug: 'health', icon: ActivityIcon, label: 'Health' },
  { slug: 'moments', icon: Camera, label: 'Moments' },
  { slug: 'grow', icon: GraduationCap, label: 'Grow' },
  { slug: 'pulse', icon: ActivityIcon, label: 'Pulse' },
  { slug: 'fit', icon: Dumbbell, label: 'Fit' },
];

type AppsSectionProps = {
  onClose: () => void;
};

export function AppsSection({ onClose }: AppsSectionProps) {
  const currentAppSlug = getCurrentAppSlug();

  const handleAppNavigation = useCallback((slug: string) => {
    onClose();
    navigateToApp(slug, currentAppSlug || 'notes');
  }, [onClose, currentAppSlug]);

  return (
    <NavigationSection title="Apps">
      {apps.map(({ slug, icon: Icon, label }) => {
        const isCurrentApp = slug === currentAppSlug;
        return (
          <button
            key={label}
            type="button"
            onClick={() => handleAppNavigation(slug)}
            disabled={isCurrentApp}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors w-full text-left",
              isCurrentApp
                ? "bg-ink-200 text-ink-900 cursor-default"
                : "text-ink-500 hover:bg-surface-muted hover:text-ink-700",
            )}
          >
            <span className="flex items-center gap-3 flex-1">
              <span className={clsx(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent transition-colors",
                isCurrentApp
                  ? "bg-ink-300/80 text-ink-900"
                  : "bg-surface-muted text-ink-600",
              )}>
                <Icon className="h-4 w-4" />
              </span>
              <span className={clsx(isCurrentApp ? "text-ink-900" : "text-inherit")}>
                {label}
              </span>
            </span>
          </button>
        );
      })}
    </NavigationSection>
  );
}
