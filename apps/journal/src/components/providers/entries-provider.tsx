"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@ainexsuite/auth";
import { useSpaces } from "./spaces-provider";
import { getUserJournalEntries, migrateSpaceJournalSharing } from "@/lib/firebase/firestore";
import type { JournalEntry } from "@ainexsuite/types";

interface EntriesContextValue {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  refreshEntries: () => Promise<void>;
}

const EntriesContext = createContext<EntriesContextValue | null>(null);

interface EntriesProviderProps {
  children: ReactNode;
}

/**
 * Provider that fetches and shares journal entries across the app.
 * Used by both the AI Insights pulldown and the dashboard.
 */
export function EntriesProvider({ children }: EntriesProviderProps) {
  const { user } = useAuth();
  const { currentSpaceId } = useSpaces();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      setEntries([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { entries: fetchedEntries } = await getUserJournalEntries(
        user.uid,
        {
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
          spaceId: currentSpaceId,
        }
      );

      setEntries(fetchedEntries);
    } catch (err) {
      console.error("Failed to load journal entries:", err);
      setError("Failed to load journal entries");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, currentSpaceId]);

  // Initial fetch and refetch when user or space changes
  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  // Migrate journal entries in shared spaces to populate sharedWithUserIds for entries created before the fix
  useEffect(() => {
    if (!user?.uid || !currentSpaceId || currentSpaceId === "personal") {
      return;
    }

    // Run migration for the current shared space (only updates entries that need it)
    migrateSpaceJournalSharing(user.uid, currentSpaceId)
      .then((count) => {
        // If entries were migrated, refetch to show the updates
        if (count > 0) {
          void fetchEntries();
        }
      })
      .catch((error) => {
        console.error("Failed to migrate space journal sharing:", error);
      });
  }, [user?.uid, currentSpaceId, fetchEntries]);

  const refreshEntries = useCallback(async () => {
    await fetchEntries();
  }, [fetchEntries]);

  return (
    <EntriesContext.Provider
      value={{
        entries,
        loading,
        error,
        refreshEntries,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
}

/**
 * Hook to access journal entries from the provider.
 */
export function useEntries(): EntriesContextValue {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error("useEntries must be used within an EntriesProvider");
  }
  return context;
}
