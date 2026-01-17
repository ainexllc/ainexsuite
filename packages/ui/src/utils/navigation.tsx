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
  FileText,
  Table2,
} from 'lucide-react';
import { SPACE_APPS, getAppUrl } from '../config/apps';
import { NotesStickyIcon } from '../components/ai';

// Wrapper to make animated icon fill the container as a background-style element
const NotesAnimatedIcon = ({ className }: { className?: string }) => (
  <div className={`absolute inset-0 flex items-center justify-center ${className}`}>
    <NotesStickyIcon size={28} color="#fbbf24" isAnimating={true} />
  </div>
);

const ICON_MAP = {
  notes: NotesAnimatedIcon,
  journal: Map,
  todo: CheckSquare,
  health: Heart,
  album: Camera,
  habits: Sprout,
  mosaic: HeartPulse,
  fit: Dumbbell,
  projects: Briefcase,
  flow: Workflow,
  calendar: Calendar,
  docs: FileText,
  tables: Table2,
  admin: Settings,
};

export function getNavigationApps(isDev: boolean = false, userEmail?: string | null) {
  return Object.values(SPACE_APPS)
    .filter(app => {
      // Check if app has email restrictions
      const allowedEmails = (app as { allowedEmails?: string[] }).allowedEmails;
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
