'use client';

import { WorkspacePageLayout } from '@ainexsuite/ui';
import { NoteBoard } from '@/components/notes/note-board';
import { WorkspaceInsights } from '@/components/notes/workspace-insights';
import { NoteComposer } from "@/components/notes/note-composer";
import { ViewToggle } from "@/components/notes/view-toggle";
import { SpaceSwitcher } from "@/components/spaces";
import { usePreferences } from "@/components/providers/preferences-provider";

export default function NotesWorkspace() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <WorkspacePageLayout
      header={
        <ViewToggle
          viewMode={preferences.viewMode}
          onViewModeChange={(mode) => updatePreferences({ viewMode: mode })}
        />
      }
      insightsBanner={<WorkspaceInsights variant="sidebar" />}
      composer={<NoteComposer />}
      composerActions={<SpaceSwitcher />}
      maxWidth="default"
    >
      <NoteBoard />
    </WorkspacePageLayout>
  );
}