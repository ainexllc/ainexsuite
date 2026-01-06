"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useAuth } from "@ainexsuite/auth";
import type { SubscriptionItem, SubscriptionFilter, SortField, SortOrder } from "@/types";
import {
  subscribeToSubscriptions,
  createSubscription as createSubscriptionMutation,
  updateSubscription as updateSubscriptionMutation,
  deleteSubscription as deleteSubscriptionMutation,
  togglePinSubscription,
} from "@/lib/firebase/subscription-service";

type SubscriptionContextValue = {
  subscriptions: SubscriptionItem[];
  pinned: SubscriptionItem[];
  others: SubscriptionItem[];
  stats: {
    totalMonthlyCost: number;
    totalYearlyCost: number;
    activeCount: number;
  };
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filters: SubscriptionFilter;
  setFilters: (filters: SubscriptionFilter) => void;
  sort: { field: SortField; order: SortOrder };
  setSort: (sort: { field: SortField; order: SortOrder }) => void;
  createSubscription: (input: Partial<SubscriptionItem>) => Promise<string | null>;
  updateSubscription: (id: string, updates: Partial<SubscriptionItem>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  togglePin: (id: string, pinned: boolean) => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SubscriptionFilter>({});
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
    field: 'nextPaymentDate',
    order: 'asc'
  });

  const userId = user?.uid ?? null;

  useEffect(() => {
    if (!userId) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSubscriptions(
      userId,
      (incoming) => {
        setSubscriptions(incoming);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to subscriptions:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleCreate = useCallback(async (input: Partial<SubscriptionItem>) => {
    if (!userId) return null;
    return await createSubscriptionMutation(userId, input);
  }, [userId]);

  const handleUpdate = useCallback(async (id: string, updates: Partial<SubscriptionItem>) => {
    if (!userId) return;
    await updateSubscriptionMutation(userId, id, updates);
  }, [userId]);

  const handleDelete = useCallback(async (id: string) => {
    if (!userId) return;
    await deleteSubscriptionMutation(userId, id);
  }, [userId]);

  const handleTogglePin = useCallback(async (id: string, pinned: boolean) => {
    if (!userId) return;
    await togglePinSubscription(userId, id, pinned);
  }, [userId]);

  const computed = useMemo(() => {
    const filtered = subscriptions.filter(sub => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!sub.name.toLowerCase().includes(query) && 
            !sub.category.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Filters
      if (filters.category && sub.category !== filters.category) return false;
      if (filters.billingCycle && sub.billingCycle !== filters.billingCycle) return false;
      if (filters.status && sub.status !== filters.status) return false;
      if (filters.minCost && sub.cost < filters.minCost) return false;
      if (filters.maxCost && sub.cost > filters.maxCost) return false;
      if (filters.labelIds?.length) {
        if (!sub.labelIds.some(id => filters.labelIds!.includes(id))) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'cost':
          comparison = a.cost - b.cost;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'nextPaymentDate':
          comparison = new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sort.order === 'asc' ? comparison : -comparison;
    });

    const pinned = filtered.filter(s => s.pinned);
    const others = filtered.filter(s => !s.pinned);

    // Stats calculation (on all subscriptions, not just filtered, usually better for "Total Spend")
    // Or should it obey filters? Let's obey filters for now so users can see "Total Video Streaming Spend".
    const totalMonthlyCost = filtered.reduce((acc, sub) => {
      if (sub.status !== 'active') return acc;
      if (sub.billingCycle === 'monthly') return acc + sub.cost;
      if (sub.billingCycle === 'yearly') return acc + (sub.cost / 12);
      if (sub.billingCycle === 'weekly') return acc + (sub.cost * 4.33);
      return acc;
    }, 0);

    const totalYearlyCost = totalMonthlyCost * 12;

    return {
      filtered,
      pinned,
      others,
      stats: {
        totalMonthlyCost,
        totalYearlyCost,
        activeCount: filtered.filter(s => s.status === 'active').length
      }
    };
  }, [subscriptions, searchQuery, filters, sort]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions: computed.filtered,
        pinned: computed.pinned,
        others: computed.others,
        stats: computed.stats,
        loading,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        sort,
        setSort,
        createSubscription: handleCreate,
        updateSubscription: handleUpdate,
        deleteSubscription: handleDelete,
        togglePin: handleTogglePin,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptions must be used within a SubscriptionProvider");
  }
  return context;
}
