/**
 * Dashboard Page Template
 *
 * Main workspace page with protected access and data loading.
 *
 * Features:
 * - Require authentication
 * - Real-time data fetching from Firestore
 * - Loading states with skeletons
 * - Error handling
 * - Empty state
 * - Create new item action
 *
 * File: app/dashboard/page.tsx
 */

"use client";

import { useAuth } from "@/hooks/useAuth";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Skeleton } from "@/components/Skeleton";

// Define your data type
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  // Firestore query
  const notesQuery = user
    ? query(
        collection(db, "users", user.uid, "notes"),
        orderBy("createdAt", "desc"),
        limit(20)
      )
    : null;

  const { data: notes, loading, error } = useFirestoreQuery<Note>(notesQuery);

  // Show loading state while checking auth
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-surface-base p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink-base">Dashboard</h1>
            <p className="mt-1 text-ink-muted">
              Welcome back, {user.displayName}
            </p>
          </div>

          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              /* Open create modal */
            }}
          >
            New Note
          </Button>
        </div>

        {/* Error state */}
        {error && (
          <ErrorMessage
            error={error}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Loading state */}
        {loading && <DashboardSkeleton />}

        {/* Empty state */}
        {!loading && !error && notes.length === 0 && (
          <Card className="py-12 text-center">
            <p className="text-lg font-semibold text-ink-base">
              No notes yet
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Get started by creating your first note
            </p>
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                /* Open create modal */
              }}
              className="mt-6"
            >
              Create Note
            </Button>
          </Card>
        )}

        {/* Data grid */}
        {!loading && !error && notes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id} hover interactive>
                <h3 className="font-semibold text-ink-base">{note.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-ink-muted">
                  {note.content}
                </p>
                <p className="mt-4 text-xs text-ink-subtle">
                  {formatRelativeTime(note.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="mb-3 h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <Skeleton className="mt-4 h-4 w-24" />
        </Card>
      ))}
    </div>
  );
}
