"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@ainexsuite/auth";
import {
  subscribeToLabels,
  createLabel as createLabelService,
  updateLabel as updateLabelService,
  deleteLabel as deleteLabelService,
} from "@/lib/firebase/label-service";
import type { Label, LabelDraft, WorkflowColor } from "@/lib/types/workflow";

interface LabelsContextValue {
  labels: Label[];
  loading: boolean;
  error: Error | null;
  createLabel: (name: string, color?: WorkflowColor) => Promise<string>;
  updateLabel: (labelId: string, updates: LabelDraft) => Promise<void>;
  deleteLabel: (labelId: string) => Promise<void>;
}

const LabelsContext = createContext<LabelsContextValue | null>(null);

export function LabelsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const userId = user?.uid ?? null;

  // Subscribe to labels
  useEffect(() => {
    if (!userId) {
      setLabels([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToLabels(userId, (labelsList) => {
      setLabels(labelsList);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleCreateLabel = useCallback(
    async (name: string, color: WorkflowColor = "default") => {
      if (!userId) {
        throw new Error("Must be authenticated to create a label");
      }
      return createLabelService(userId, { name, color });
    },
    [userId]
  );

  const handleUpdateLabel = useCallback(
    async (labelId: string, updates: LabelDraft) => {
      if (!userId) {
        throw new Error("Must be authenticated to update a label");
      }
      await updateLabelService(userId, labelId, updates);
    },
    [userId]
  );

  const handleDeleteLabel = useCallback(
    async (labelId: string) => {
      if (!userId) {
        throw new Error("Must be authenticated to delete a label");
      }
      await deleteLabelService(userId, labelId);
    },
    [userId]
  );

  const value = useMemo<LabelsContextValue>(
    () => ({
      labels,
      loading,
      error,
      createLabel: handleCreateLabel,
      updateLabel: handleUpdateLabel,
      deleteLabel: handleDeleteLabel,
    }),
    [labels, loading, error, handleCreateLabel, handleUpdateLabel, handleDeleteLabel]
  );

  return (
    <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>
  );
}

export function useLabels(): LabelsContextValue {
  const context = useContext(LabelsContext);

  if (!context) {
    throw new Error("useLabels must be used within a LabelsProvider");
  }

  return context;
}
