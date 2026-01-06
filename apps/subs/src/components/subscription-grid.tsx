"use client";

import { useSubscriptions } from "@/components/providers/subscription-provider";
import { format } from "date-fns";
import { 
  CreditCard, 
  MoreVertical, 
  Trash2, 
  Pin, 
  PinOff 
} from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import type { SubscriptionItem } from "@/types";

export function SubscriptionGrid() {
  const { subscriptions, togglePin, deleteSubscription } = useSubscriptions();

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <CreditCard className="h-10 w-10 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No subscriptions yet</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          Add your first subscription above to start tracking your recurring expenses.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {subscriptions.map((sub) => (
        <SubscriptionCard 
          key={sub.id} 
          subscription={sub} 
          onTogglePin={() => togglePin(sub.id, !sub.pinned)}
          onDelete={() => deleteSubscription(sub.id)}
        />
      ))}
    </div>
  );
}

function SubscriptionCard({ 
  subscription, 
  onTogglePin, 
  onDelete 
}: { 
  subscription: SubscriptionItem;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const nextPayment = new Date(subscription.nextPaymentDate);
  const isSoon = nextPayment.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // Within 7 days

  return (
    <div className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              {subscription.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground truncate max-w-[120px]" title={subscription.name}>
                {subscription.name}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">{subscription.billingCycle}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {showMenu && (
          <div className="absolute top-12 right-4 z-10 w-36 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg py-1">
            <button 
              onClick={() => { onTogglePin(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
            >
              {subscription.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              {subscription.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button 
              onClick={() => { onDelete(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              ${subscription.cost.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Next Payment</span>
            <span className={clsx("font-medium", isSoon ? "text-amber-500" : "text-foreground")}>
              {format(nextPayment, "MMM d, yyyy")}
            </span>
          </div>
          {isSoon && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
              Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
