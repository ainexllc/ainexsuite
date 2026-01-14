"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@ainexsuite/auth";
import type { Label, LabelDraft } from "@/lib/types/note";
import {
  createLabel as createLabelMutation,
  deleteLabel as deleteLabelMutation,
  subscribeToLabels,
  updateLabel as updateLabelMutation,
} from "@/lib/firebase/label-service";

type LabelsContextValue = {
  labels: Label[];
  loading: boolean;
  createLabel: (draft: LabelDraft) => Promise<string | null>;
  updateLabel: (labelId: string, updates: LabelDraft) => Promise<void>;
  deleteLabel: (labelId: string) => Promise<void>;
};

const LabelsContext = createContext<LabelsContextValue | null>(null);

type LabelsProviderProps = {
  children: React.ReactNode;
};

export function LabelsProvider({ children }: LabelsProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.uid ?? null;

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

  const handleCreate = useCallback(
    async (draft: LabelDraft) => {
      if (!userId) {
        return null;
      }

      try {
        const result = await createLabelMutation(userId, draft);
        return result;
      } catch (error) {
        console.error("[LabelsProvider] Failed to create label:", error);
        throw error;
      }
    },
    [userId],
  );

  const handleUpdate = useCallback(
    async (labelId: string, updates: LabelDraft) => {
      if (!userId) {
        return;
      }

      await updateLabelMutation(userId, labelId, updates);
    },
    [userId],
  );

  const handleDelete = useCallback(
    async (labelId: string) => {
      if (!userId) {
        return;
      }

      await deleteLabelMutation(userId, labelId);
    },
    [userId],
  );

  const value = useMemo<LabelsContextValue>(
    () => ({
      labels,
      loading,
      createLabel: handleCreate,
      updateLabel: handleUpdate,
      deleteLabel: handleDelete,
    }),
    [labels, loading, handleCreate, handleUpdate, handleDelete],
  );

  return <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>;
}

// Default context value for SSG/SSR when no provider is present
const defaultLabelsValue: LabelsContextValue = {
  labels: [],
  loading: true,
  createLabel: async () => null,
  updateLabel: async () => {},
  deleteLabel: async () => {},
};

export function useLabels() {
  const context = useContext(LabelsContext);

  // Return default values during SSG/SSR instead of throwing
  if (!context) {
    return defaultLabelsValue;
  }

  return context;
}
