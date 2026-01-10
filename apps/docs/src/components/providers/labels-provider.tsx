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
import type { Label, LabelDraft } from "@/lib/types/doc";
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
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.uid ?? null;
  // Wait for Firebase Auth to be signed in before subscribing to Firestore
  const isFirestoreReady = !authLoading && !!userId && !!firebaseUser;

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isFirestoreReady) {
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
  }, [authLoading, userId, isFirestoreReady]);

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

export function useLabels() {
  const context = useContext(LabelsContext);

  if (!context) {
    throw new Error("useLabels must be used within a LabelsProvider.");
  }

  return context;
}
