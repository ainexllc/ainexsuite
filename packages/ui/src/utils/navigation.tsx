'use client';

import {
  Map,
  CheckSquare,
  Heart,
  Camera,
  Sprout,
  HeartPulse,
  Dumbbell,
  Briefcase,
  Workflow,
  Calendar,
  Settings,
} from 'lucide-react';
import { SUITE_APPS, getAppUrl } from '../config/apps';
import { NotesStickyIcon } from '../components/ai';

// Wrapper to make animated icon fill the container as a background-style element
const NotesAnimatedIcon = ({ className }: { className?: string }) => (
  <div className={`absolute inset-0 flex items-center justify-center ${className}`}>
    <NotesStickyIcon size={28} color="#fbbf24" isAnimating={true} />
  </div>
);

const ICON_MAP = {
  notes: NotesAnimatedIcon,
  journey: Map,
  todo: CheckSquare,
  health: Heart,
  moments: Camera,
  grow: Sprout,
  pulse: HeartPulse,
  fit: Dumbbell,
  project: Briefcase,
  workflow: Workflow,
  calendar: Calendar,
  admin: Settings,
};

export function getNavigationApps(isDev: boolean = false, userEmail?: string | null) {
  return Object.values(SUITE_APPS)
    .filter(app => {
      // Check if app has email restrictions
      const allowedEmails = (app as any).allowedEmails as string[] | undefined;
      if (!allowedEmails || allowedEmails.length === 0) {
        return true;
      }
      // Only show restricted apps to allowed users
      return userEmail && allowedEmails.includes(userEmail);
    })
    .map(app => ({
      name: app.name,
      slug: app.slug,
      description: app.description,
      color: app.color,
      icon: ICON_MAP[app.slug as keyof typeof ICON_MAP] || Briefcase,
      url: getAppUrl(app.slug, isDev),
    }));
}
