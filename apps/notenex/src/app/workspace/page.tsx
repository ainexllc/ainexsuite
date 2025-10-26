import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { NoteBoard } from "@/components/notes/note-board";

export default function WorkspacePage() {
  return (
    <AppShell>
      <ProtectedRoute>
        <NoteBoard />
      </ProtectedRoute>
    </AppShell>
  );
}
