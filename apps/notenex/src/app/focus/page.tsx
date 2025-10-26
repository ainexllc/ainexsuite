import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { Clock8, Headphones, PauseCircle, PlayCircle, Timer } from "lucide-react";

export default function FocusPage() {
  return (
    <AppShell>
      <div className="space-y-10">
        <PagePlaceholder
          icon={Clock8}
          title="Find your flow state"
          description="Block distractions, pair your notes with ambient timers, and stay present while capturing ideas."
          actions={
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-ink-50 shadow-sm transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
            >
              Launch focus workspace
            </Link>
          }
        >
          <div className="grid gap-5 text-left sm:grid-cols-2">
            <div className="rounded-3xl border border-outline-subtle/60 bg-white/80 px-6 py-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <Timer className="h-4 w-4 text-accent-600" aria-hidden />
                Adaptive sprint timers
              </h2>
              <p className="mt-2 text-sm text-muted">
                Switch between 25, 45, and 90-minute sessions with automatic breaks synced to your reminders.
              </p>
            </div>
            <div className="rounded-3xl border border-outline-subtle/60 bg-white/80 px-6 py-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <Headphones className="h-4 w-4 text-accent-600" aria-hidden />
                Focus playlists
              </h2>
              <p className="mt-2 text-sm text-muted">
                Pair notes with ambient soundtracks and mark sessions complete to unlock progress streaks.
              </p>
            </div>
            <div className="rounded-3xl border border-outline-subtle/60 bg-white/80 px-6 py-5 shadow-sm sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-ink-800">
                    Quick controls
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Pause, resume, or skip sessions without leaving your keyboard.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-sm font-medium text-ink-600">
                  <PlayCircle className="h-5 w-5" aria-hidden />
                  <PauseCircle className="h-5 w-5" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </PagePlaceholder>
      </div>
    </AppShell>
  );
}
