'use client';

import { NoteBoard } from '@/components/notes/note-board';
import { WorkspaceInsights } from '@/components/notes/workspace-insights';

export default function NotesWorkspace() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* AI Insights Banner - Full Width at Top */}
      <WorkspaceInsights variant="sidebar" />

      {/* Notes Content with SpaceSwitcher integrated */}
      <NoteBoard />
    </div>
  );
}