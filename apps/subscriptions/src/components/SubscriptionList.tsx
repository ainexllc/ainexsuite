'use client';

import { useSubscriptionStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { CreditCard, Calendar, Tag } from 'lucide-react';
import Image from 'next/image';

export function SubscriptionList() {
  const { subscriptions } = useSubscriptionStore();

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-white/5 p-6 rounded-full mb-4">
          <CreditCard className="h-10 w-10 text-white/20" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No subscriptions yet</h3>
        <p className="text-zinc-400 max-w-sm">
          Add your first subscription to start tracking your recurring expenses.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          className="group relative bg-white/5 border border-white/10 hover:border-accent-500/50 rounded-xl p-5 transition-all hover:shadow-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xl overflow-hidden relative">
                {sub.logoUrl ? (
                  <Image src={sub.logoUrl} alt={sub.name} fill className="object-cover" />
                ) : (
                  <span>{sub.name[0]}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white leading-tight">{sub.name}</h3>
                <span className="text-xs text-zinc-500 capitalize">{sub.billingCycle}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white text-lg">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: sub.currency }).format(sub.cost)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Next: {format(parseISO(sub.nextPaymentDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>{sub.category}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}