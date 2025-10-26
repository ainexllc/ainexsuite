import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { BrainCircuit, Lightbulb, NotebookPen, Sparkles } from "lucide-react";

export default function IdeasPage() {
  return (
    <AppShell>
      <div className="space-y-10">
        <PagePlaceholder
          icon={Sparkles}
          title="Co-create with NoteNex AI"
          description="Draft outlines, summarize long notes, and remix ideas into new experiments without leaving your workspace."
          actions={
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-ink-50 shadow-sm transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
            >
              Draft from an existing note
            </Link>
          }
        >
          <div className="grid gap-5 text-left sm:grid-cols-3">
            <div className="rounded-3xl border border-outline-subtle/60 bg-white/80 px-6 py-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <BrainCircuit className="h-4 w-4 text-accent-600" aria-hidden />
                Idea expansion
              </h2>
              <p className="mt-2 text-sm text-muted">
                Turn bullet points into polished outlines and get alternative takes instantly.
              </p>
            </div>
            <div className="rounded-3xl border border-outline-subtle/60 bg-white/80 px-6 py-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <NotebookPen className="h-4 w-4 text-accent-600" aria-hidden />
                Structured templates
              </h2>
              <p className="mt-2 text-sm text-muted">
                Start with interview summaries, design briefs, meeting notes, and more.
              </p>
            </div>
            <div className="rounded-3xl border border-outline-subtle/60 bg-white/80 px-6 py-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <Lightbulb className="h-4 w-4 text-accent-600" aria-hidden />
                Guided prompts
              </h2>
              <p className="mt-2 text-sm text-muted">
                Feed context from any note to generate targeted prompts that unblock your thinking.
              </p>
            </div>
          </div>
        </PagePlaceholder>
      </div>
    </AppShell>
  );
}
