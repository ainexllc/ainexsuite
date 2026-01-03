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

import { useState } from "react";
import type { SubscriptionItem } from "@/types";

export function SubscriptionList() {
  const { subscriptions, togglePin, deleteSubscription } = useSubscriptions();

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <CreditCard className="h-10 w-10 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No subscriptions yet</h3>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-muted-foreground font-medium">
          <tr>
            <th className="px-6 py-3 w-12"></th>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Cost</th>
            <th className="px-6 py-3">Cycle</th>
            <th className="px-6 py-3">Next Payment</th>
            <th className="px-6 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {subscriptions.map((sub) => (
            <SubscriptionRow 
              key={sub.id} 
              subscription={sub} 
              onTogglePin={() => togglePin(sub.id, !sub.pinned)}
              onDelete={() => deleteSubscription(sub.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionRow({ 
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

  return (
    <tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-6 py-4">
         <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            {subscription.name.charAt(0).toUpperCase()}
         </div>
      </td>
      <td className="px-6 py-4 font-medium text-foreground">{subscription.name}</td>
      <td className="px-6 py-4 text-foreground font-semibold">${subscription.cost.toFixed(2)}</td>
      <td className="px-6 py-4 text-muted-foreground capitalize">{subscription.billingCycle}</td>
      <td className="px-6 py-4 text-muted-foreground">{format(nextPayment, "MMM d, yyyy")}</td>
      <td className="px-6 py-4 relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {showMenu && (
          <div className="absolute top-10 right-4 z-10 w-36 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg py-1">
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
      </td>
    </tr>
  );
}
