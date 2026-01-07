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
import type { FilterValue, SortConfig } from "@ainexsuite/ui";
import type { FilterPreset, CreateFilterPresetInput } from "@/lib/types/filter-preset";
import {
  subscribeToFilterPresets,
  createFilterPreset as createFilterPresetMutation,
  deleteFilterPreset as deleteFilterPresetMutation,
} from "@/lib/firebase/filter-presets-service";

type FilterPresetsContextValue = {
  presets: FilterPreset[];
  loading: boolean;
  createPreset: (name: string, filters: FilterValue, sort?: SortConfig) => Promise<string>;
  deletePreset: (presetId: string) => Promise<void>;
  getPresetById: (presetId: string) => FilterPreset | undefined;
};

const FilterPresetsContext = createContext<FilterPresetsContextValue | null>(null);

type FilterPresetsProviderProps = {
  children: React.ReactNode;
};

export function FilterPresetsProvider({ children }: FilterPresetsProviderProps) {
  const { user } = useAuth();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.uid ?? null;

  useEffect(() => {
    if (!userId) {
      setPresets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToFilterPresets(userId, (incoming) => {
      setPresets(incoming);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleCreatePreset = useCallback(
    async (name: string, filters: FilterValue, sort?: SortConfig): Promise<string> => {
      if (!userId) {
        throw new Error("User must be logged in to create presets");
      }

      const input: CreateFilterPresetInput = {
        name,
        filters,
        sort,
      };

      return createFilterPresetMutation(userId, input);
    },
    [userId],
  );

  const handleDeletePreset = useCallback(
    async (presetId: string): Promise<void> => {
      if (!userId) {
        throw new Error("User must be logged in to delete presets");
      }

      await deleteFilterPresetMutation(userId, presetId);
    },
    [userId],
  );

  const getPresetById = useCallback(
    (presetId: string): FilterPreset | undefined => {
      return presets.find((preset) => preset.id === presetId);
    },
    [presets],
  );

  const value = useMemo<FilterPresetsContextValue>(
    () => ({
      presets,
      loading,
      createPreset: handleCreatePreset,
      deletePreset: handleDeletePreset,
      getPresetById,
    }),
    [presets, loading, handleCreatePreset, handleDeletePreset, getPresetById],
  );

  return (
    <FilterPresetsContext.Provider value={value}>
      {children}
    </FilterPresetsContext.Provider>
  );
}

export function useFilterPresets() {
  const context = useContext(FilterPresetsContext);

  if (!context) {
    throw new Error("useFilterPresets must be used within a FilterPresetsProvider.");
  }

  return context;
}
