import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import { BellRing, PlusCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReminderList } from "@/components/reminders/reminder-list";

export default function RemindersPage() {
  return (
    <AppShell>
      <ProtectedRoute>
        <div className="space-y-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-600">
                <BellRing className="h-3.5 w-3.5" /> Reminders
              </div>
              <h1 className="text-2xl font-semibold text-ink-800">Stay ahead of every follow-up</h1>
              <p className="text-sm text-muted">
                Schedule nudges from any note, choose how you want to be notified, and keep work moving forward.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-full border border-outline-subtle px-4 py-2 text-sm font-medium text-ink-600 transition hover:border-outline-strong hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
              >
                <PlusCircle className="h-4 w-4" /> Create from note board
              </Link>
            </div>
          </header>

          <ReminderList />
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}
