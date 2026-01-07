"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { useDocs } from "@/components/providers/docs-provider";
import { useAuth } from "@/lib/auth/auth-context";
import { DocCard } from "@/components/docs/doc-card";

function NotesSkeleton() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 break-inside-avoid rounded-3xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </div>
  );
}

export function SharedDocsBoard() {
  const { allDocs, loading } = useDocs();
  const { user } = useAuth();

  const [sharedWithMe, sharedByMe] = useMemo(() => {
    if (!user) {
      return [[], []];
    }

    const mine: typeof allDocs = [];
    const incoming: typeof allDocs = [];

    allDocs.forEach(doc => {
      if (doc.ownerId === user.id) {
        if (doc.sharedWithUserIds?.length) {
          mine.push(doc);
        }
      } else if (doc.sharedWithUserIds?.includes(user.id)) {
        incoming.push(doc);
      }
    });

    return [incoming, mine];
  }, [allDocs, user]);

  if (loading) {
    return <NotesSkeleton />;
  }

  const hasSharedContent = sharedWithMe.length || sharedByMe.length;

  if (!hasSharedContent) {
    return (
      <EmptyState
        title="No shared docs yet"
        description="Invite collaborators from any doc to see them here."
        icon={Users}
        variant="default"
      />
    );
  }

  return (
    <div className="space-y-8">
      {sharedWithMe.length ? (
        <ListSection title="Shared with me" count={sharedWithMe.length}>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {sharedWithMe.map(doc => (
              <div key={doc.id} className="mb-4">
                <DocCard doc={doc} />
              </div>
            ))}
          </div>
        </ListSection>
      ) : null}

      {sharedByMe.length ? (
        <ListSection title="Shared by me" count={sharedByMe.length}>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {sharedByMe.map(doc => (
              <div key={doc.id} className="mb-4">
                <DocCard doc={doc} />
              </div>
            ))}
          </div>
        </ListSection>
      ) : null}
    </div>
  );
}
