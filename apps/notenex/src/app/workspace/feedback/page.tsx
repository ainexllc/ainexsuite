"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Check, Loader2, MessageSquare, Send, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Container } from "@/components/layout/container";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuth } from "@/lib/auth/auth-context";
import {
  deleteFeedback,
  submitFeedback,
  subscribeToFeedback,
} from "@/lib/firebase/feedback-service";
import type { Feedback } from "@/lib/types/feedback";

export default function WorkspaceFeedbackPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.displayName ?? "");
    setEmail(user?.email ?? "");
  }, [user?.displayName, user?.email]);

  useEffect(() => {
    const unsubscribe = subscribeToFeedback((incoming) => {
      setEntries(incoming);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const canSubmit = useMemo(() => message.trim().length >= 8, [message]);

  const handleDeleteClick = (feedbackId: string) => {
    setFeedbackToDelete(feedbackId);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setFeedbackToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!feedbackToDelete) {
      return;
    }

    try {
      setDeletingId(feedbackToDelete);
      await deleteFeedback(feedbackToDelete);
      setShowDeleteConfirm(false);
      setFeedbackToDelete(null);
    } catch (deleteError) {
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete feedback. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);
      await submitFeedback({
        userId: user?.id ?? null,
        authorName: name.trim() ? name.trim() : user?.displayName ?? null,
        authorEmail: email.trim() ? email.trim() : user?.email ?? null,
        message: message.trim(),
      });
      setMessage("");
      setSuccess(true);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (feedbackError) {
      setError(
        feedbackError instanceof Error
          ? feedbackError.message
          : "Something went wrong while sending feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <ProtectedRoute>
        <Container variant="narrow" className="space-y-10">
          <section className="rounded-3xl border border-outline-subtle/60 bg-surface-elevated/90 p-8 shadow-floating backdrop-blur-xl transition-colors">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Feedback
                </div>
                <h1 className="mt-3 text-2xl font-semibold text-ink-800">
                  Help us polish NoteNex
                </h1>
                <p className="text-sm text-muted">
                  Drop quick thoughts, wishlist items, or report any quirks you spot. We read every note.
                </p>
              </div>
            </header>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Name (optional)
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="How should we address you?"
                    className="w-full rounded-xl border border-outline-subtle bg-transparent px-3 py-2 text-sm text-ink-700 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Email (optional)
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Add an email if you'd like a reply"
                    className="w-full rounded-xl border border-outline-subtle bg-transparent px-3 py-2 text-sm text-ink-700 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Feedback
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what’s working great, what’s confusing, or what you'd love to see next."
                  rows={4}
                  className="w-full rounded-2xl border border-outline-subtle bg-transparent px-4 py-3 text-sm text-ink-700 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none"
                  required
                />
              </label>

              {error ? (
                <p className="text-sm font-medium text-danger">• {error}</p>
              ) : null}

              {success ? (
                <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
                  <Check className="h-4 w-4" />
                  <span>Thank you! Your feedback has been submitted.</span>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  Minimum 8 characters. We keep things concise so the team can triage quickly.
                </p>
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                    canSubmit
                      ? "bg-accent-500 text-ink-50 hover:bg-accent-400"
                      : "bg-surface-muted text-ink-500",
                  )}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send feedback
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-800">Latest notes</h2>
              <span className="text-xs text-muted">
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 rounded-3xl border border-outline-subtle/60 bg-surface-elevated/70 px-5 py-4 text-sm text-muted transition-colors">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching feedback…
              </div>
            ) : entries.length ? (
              <ul className="space-y-3">
                {entries.map((entry) => {
                  const isOwner = user?.id && entry.userId === user.id;
                  const isDeleting = deletingId === entry.id;

                  return (
                    <li
                      key={entry.id}
                      className="rounded-3xl border border-outline-subtle/40 bg-surface-elevated/85 px-5 py-4 shadow-floating transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-ink-800">
                          {entry.authorName?.trim() || "Anonymous"}
                        </div>
                        <div className="flex items-center gap-3">
                          <time className="text-xs uppercase tracking-wide text-muted">
                            {entry.createdAt.toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                          {isOwner ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(entry.id)}
                              disabled={isDeleting}
                              className="icon-button h-8 w-8 text-danger hover:bg-danger/10"
                              aria-label="Delete feedback"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-ink-700">
                        {entry.message}
                      </p>
                      {entry.authorEmail ? (
                        <p className="mt-3 text-xs text-ink-400">
                          Reach out:{" "}
                          <a
                            href={`mailto:${entry.authorEmail}`}
                            className="underline hover:text-ink-600"
                          >
                            {entry.authorEmail}
                          </a>
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-3xl border border-dashed border-outline-subtle/70 bg-surface-elevated/60 px-5 py-12 text-center text-sm text-muted transition-colors">
                No feedback yet—be the first to share your thoughts.
              </div>
            )}
          </section>
        </Container>
      </ProtectedRoute>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Feedback?"
        message="This will permanently remove your feedback. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isProcessing={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </AppShell>
  );
}
