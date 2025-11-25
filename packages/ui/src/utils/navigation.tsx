import {
  StickyNote,
  Map,
  CheckSquare,
  Heart,
  Camera,
  Sprout,
  HeartPulse,
  Dumbbell,
  Briefcase,
  Workflow
} from 'lucide-react';
import { SUITE_APPS, getAppUrl } from '../config/apps';

const ICON_MAP = {
  notes: StickyNote,
  journey: Map,
  todo: CheckSquare,
  health: Heart,
  moments: Camera,
  grow: Sprout,
  pulse: HeartPulse,
  fit: Dumbbell,
  projects: Briefcase,
  workflow: Workflow,
};

export function getNavigationApps(isDev: boolean = false) {
  return Object.values(SUITE_APPS).map(app => ({
    name: app.name,
    slug: app.slug,
    description: app.description,
    color: app.color,
    icon: ICON_MAP[app.slug as keyof typeof ICON_MAP] || Briefcase,
    url: getAppUrl(app.slug, isDev),
  }));
}
