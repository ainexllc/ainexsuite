"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/lib/auth/auth-context";
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
  const { status, user } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (status !== "authenticated" || !userId) {
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
  }, [status, userId]);

  const handleCreate = useCallback(
    async (draft: LabelDraft) => {
      if (!userId) {
        return null;
      }

      return createLabelMutation(userId, draft);
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

export function useLabels() {
  const context = useContext(LabelsContext);

  if (!context) {
    throw new Error("useLabels must be used within a LabelsProvider.");
  }

  return context;
}
