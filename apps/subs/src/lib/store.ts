import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SubscriptionItem, ViewType } from '../types';

interface SubscriptionState {
  subscriptions: SubscriptionItem[];
  viewPreference: ViewType;
  currency: string;
  
  setSubscriptions: (subs: SubscriptionItem[]) => void;
  addSubscription: (sub: SubscriptionItem) => void;
  updateSubscription: (id: string, updates: Partial<SubscriptionItem>) => void;
  deleteSubscription: (id: string) => void;
  setViewPreference: (view: ViewType) => void;
  setCurrency: (currency: string) => void;
  
  // Computed helpers could go here or in hooks
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],
      viewPreference: 'list',
      currency: 'USD',

      setSubscriptions: (subscriptions) => set({ subscriptions }),
      
      addSubscription: (sub) => set((state) => ({ 
        subscriptions: [...state.subscriptions, sub] 
      })),

      updateSubscription: (id, updates) => set((state) => ({
        subscriptions: state.subscriptions.map((s) => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),

      deleteSubscription: (id) => set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s.id !== id)
      })),

      setViewPreference: (viewPreference) => set({ viewPreference }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'subscriptions-storage',
      partialize: (state) => ({ 
        viewPreference: state.viewPreference,
        currency: state.currency 
        // We usually persist data too for offline support, but in real app we rely on Firebase sync 
        // For now we persist subscriptions locally as well for the prototype
      }), 
    }
  )
);
