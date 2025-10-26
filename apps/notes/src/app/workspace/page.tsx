'use client';

import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { NoteBoard } from "@/components/notes/note-board";
import { AppActivationModal, useAppActivation, useAuth } from "@ainexsuite/auth";

export default function WorkspacePage() {
  const { needsActivation, checking } = useAppActivation('notes');
  const { signOut } = useAuth();

  // Show activation modal if user needs to activate Notes
  if (needsActivation && !checking) {
    return (
      <AppShell>
        <AppActivationModal
          appName="notes"
          appDisplayName="Notes"
          onActivated={() => window.location.reload()}
          onDifferentEmail={async () => {
            // Sign out current user and redirect to Notes homepage with login box
            await signOut();
            window.location.href = '/#login';
          }}
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
