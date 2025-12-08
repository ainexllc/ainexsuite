'use client';

import { NoteBoard } from '@/components/notes/note-board';
import { WorkspaceInsights } from '@/components/notes/workspace-insights';
import { SpaceSwitcher } from '@/components/spaces';

export default function NotesWorkspace() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* AI Insights Banner - Full Width at Top */}
      <WorkspaceInsights variant="sidebar" />

      {/* Space Switcher */}
      <div className="flex items-center gap-4">
        <SpaceSwitcher />
      </div>

      {/* Notes Content - Full Width */}
      <NoteBoard />
    </div>
  );
}