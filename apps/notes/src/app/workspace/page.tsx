'use client';

import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { NoteBoard } from "@/components/notes/note-board";
import { AppActivationModal, useAppActivation } from "@ainexsuite/auth";

export default function WorkspacePage() {
  const { needsActivation, checking } = useAppActivation('notes');

  // Show activation modal if user needs to activate Notes
  if (needsActivation && !checking) {
    return (
      <AppShell>
        <AppActivationModal
          appName="notes"
          appDisplayName="Notes"
          onActivated={() => window.location.reload()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ProtectedRoute>
        <NoteBoard />
      </ProtectedRoute>
    </AppShell>
  );
}
