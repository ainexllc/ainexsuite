import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SharedTablesBoard } from "@/components/tables/shared-tables";
import Link from "next/link";
import { Share2, Users } from "lucide-react";

export default function SharedPage() {
  return (
    <AppShell>
      <ProtectedRoute>
        <div className="space-y-8">
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-600">
                <Users className="h-3.5 w-3.5" /> Shared workspace
              </div>
              <h1 className="text-2xl font-semibold text-ink-800">Collaborate in real time</h1>
              <p className="text-sm text-muted">
                Invite teammates, assign roles, and stay aligned across every shared table.
              </p>
            </div>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-50 shadow-sm transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
            >
              <Share2 className="h-4 w-4" /> Share a table
            </Link>
          </header>

          <SharedTablesBoard />
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}
