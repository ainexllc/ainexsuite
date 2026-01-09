"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWorkspaceAuth } from "@ainexsuite/auth";
import type { Label, LabelDraft } from "@/lib/types/project";
import {
  createLabel as createLabelMutation,
  deleteLabel as deleteLabelMutation,
  subscribeToLabels,
  updateLabel as updateLabelMutation,
} from "@/lib/firebase/label-service";

// ============ Types ============

type LabelsContextValue = {
  /** All labels for the current user */
  labels: Label[];
  /** Loading state for initial fetch */
  loading: boolean;
  /** Create a new label */
  createLabel: (draft: LabelDraft) => Promise<string | null>;
  /** Update an existing label */
  updateLabel: (labelId: string, updates: LabelDraft) => Promise<void>;
  /** Delete a label */
  deleteLabel: (labelId: string) => Promise<void>;
  /** Get a single label by ID */
  getLabelById: (labelId: string) => Label | undefined;
  /** Get multiple labels by their IDs */
  getLabelsByIds: (labelIds: string[]) => Label[];
};

type LabelsProviderProps = {
  children: React.ReactNode;
};

// ============ Context ============

const LabelsContext = createContext<LabelsContextValue | null>(null);

// ============ Provider ============

export function LabelsProvider({ children }: LabelsProviderProps) {
  const { user, loading: authLoading } = useWorkspaceAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.uid ?? null;

  // Subscribe to labels collection
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!userId) {
      setLabels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToLabels(userId, (incoming) => {
      setLabels(incoming);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authLoading, userId]);

  // ============ CRUD Operations ============

  const handleCreate = useCallback(
    async (draft: LabelDraft): Promise<string | null> => {
      if (!userId) {
        return null;
      }

      try {
        const labelId = await createLabelMutation(userId, draft);
        return labelId;
      } catch (error) {
        console.error("[LabelsProvider] Failed to create label:", error);
        throw error;
      }
    },
    [userId]
  );

  const handleUpdate = useCallback(
    async (labelId: string, updates: LabelDraft): Promise<void> => {
      if (!userId) {
        return;
      }

      try {
        await updateLabelMutation(userId, labelId, updates);
      } catch (error) {
        console.error("[LabelsProvider] Failed to update label:", error);
        throw error;
      }
    },
    [userId]
  );

  const handleDelete = useCallback(
    async (labelId: string): Promise<void> => {
      if (!userId) {
        return;
      }

      try {
        await deleteLabelMutation(userId, labelId);
      } catch (error) {
        console.error("[LabelsProvider] Failed to delete label:", error);
        throw error;
      }
    },
    [userId]
  );

  // ============ Helper Functions ============

  const getLabelById = useCallback(
    (labelId: string): Label | undefined => {
      return labels.find((label) => label.id === labelId);
    },
    [labels]
  );

  const getLabelsByIds = useCallback(
    (labelIds: string[]): Label[] => {
      if (labelIds.length === 0) {
        return [];
      }

      const idSet = new Set(labelIds);
      return labels.filter((label) => idSet.has(label.id));
    },
    [labels]
  );

  // ============ Context Value ============

  const value = useMemo<LabelsContextValue>(
    () => ({
      labels,
      loading,
      createLabel: handleCreate,
      updateLabel: handleUpdate,
      deleteLabel: handleDelete,
      getLabelById,
      getLabelsByIds,
    }),
    [
      labels,
      loading,
      handleCreate,
      handleUpdate,
      handleDelete,
      getLabelById,
      getLabelsByIds,
    ]
  );

  return (
    <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>
  );
}

// ============ Hook ============

/**
 * Hook to access labels context.
 * Must be used within a LabelsProvider.
 *
 * @example
 * const { labels, createLabel, getLabelById } = useLabels();
 *
 * // Get all labels
 * labels.map(label => label.name);
 *
 * // Create a new label
 * const labelId = await createLabel({ name: "Important", color: "project-tangerine" });
 *
 * // Get a specific label
 * const label = getLabelById("some-label-id");
 *
 * // Get multiple labels by IDs
 * const projectLabels = getLabelsByIds(project.labelIds);
 */
export function useLabels(): LabelsContextValue {
  const context = useContext(LabelsContext);

  if (!context) {
    throw new Error("useLabels must be used within a LabelsProvider.");
  }

  return context;
}
