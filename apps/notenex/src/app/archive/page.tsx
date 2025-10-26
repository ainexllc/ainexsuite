import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ArchiveBoard } from "@/components/notes/archive-board";

export default function ArchivePage() {
  return (
    <AppShell>
      <ProtectedRoute>
        <ArchiveBoard />
      </ProtectedRoute>
    </AppShell>
  );
}
