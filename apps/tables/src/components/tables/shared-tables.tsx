"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { useTables } from "@/components/providers/tables-provider";
import { useAuth } from "@/lib/auth/auth-context";
import { TableCard } from "@/components/tables/table-card";

function TablesSkeleton() {
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

export function SharedTablesBoard() {
  const { allTables, loading } = useTables();
  const { user } = useAuth();

  const [sharedWithMe, sharedByMe] = useMemo(() => {
    if (!user) {
      return [[], []];
    }

    const mine: typeof allTables = [];
    const incoming: typeof allTables = [];

    allTables.forEach(table => {
      if (table.ownerId === user.id) {
        if (table.sharedWithUserIds?.length) {
          mine.push(table);
        }
      } else if (table.sharedWithUserIds?.includes(user.id)) {
        incoming.push(table);
      }
    });

    return [incoming, mine];
  }, [allTables, user]);

  if (loading) {
    return <TablesSkeleton />;
  }

  const hasSharedContent = sharedWithMe.length || sharedByMe.length;

  if (!hasSharedContent) {
    return (
      <EmptyState
        title="No shared tables yet"
        description="Invite collaborators from any table to see them here."
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
            {sharedWithMe.map(table => (
              <div key={table.id} className="mb-4">
                <TableCard table={table} />
              </div>
            ))}
          </div>
        </ListSection>
      ) : null}

      {sharedByMe.length ? (
        <ListSection title="Shared by me" count={sharedByMe.length}>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {sharedByMe.map(table => (
              <div key={table.id} className="mb-4">
                <TableCard table={table} />
              </div>
            ))}
          </div>
        </ListSection>
      ) : null}
    </div>
  );
}
