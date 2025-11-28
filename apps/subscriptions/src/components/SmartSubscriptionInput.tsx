'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useSubscriptionStore } from '@/lib/store';
import { SubscriptionItem } from '@/types';

export function SmartSubscriptionInput() {
  const { addSubscription } = useSubscriptionStore();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const parseSubscription = (text: string): Partial<SubscriptionItem> => {
    const lower = text.toLowerCase();
    let cost = 0;
    let name = text;
    let billingCycle: 'monthly' | 'yearly' = 'monthly';

    // Extract cost
    const costMatch = text.match(/\$(\d+(\.\d{2})?)/) || text.match(/(\d+(\.\d{2})?)/);
    if (costMatch) {
      cost = parseFloat(costMatch[1]);
      name = name.replace(costMatch[0], '').replace('$', '').trim();
    }

    // Extract cycle
    if (lower.includes('yearly') || lower.includes('year') || lower.includes('annual')) {
      billingCycle = 'yearly';
      name = name.replace(/yearly|year|annual/gi, '').trim();
    } else if (lower.includes('monthly') || lower.includes('month')) {
      billingCycle = 'monthly';
      name = name.replace(/monthly|month/gi, '').trim();
    }

    // Clean up name
    name = name.replace(/\s+/g, ' ').trim();

    // Default next payment (1 month/year from today)
    const nextPaymentDate = new Date();
    if (billingCycle === 'monthly') nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    else nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);

    return {
      name,
      cost,
      currency: 'USD',
      billingCycle,
      nextPaymentDate: nextPaymentDate.toISOString(),
      startDate: new Date().toISOString(),
      status: 'active',
      category: 'Uncategorized',
      userId: 'user_id_placeholder' // Should come from auth context
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const parsed = parseSubscription(input);
    
    const newSub: SubscriptionItem = {
      ...parsed as SubscriptionItem,
      id: `sub_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSubscription(newSub);
    setInput('');
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-xl p-2 shadow-xl focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
          <div className="p-2 text-emerald-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Quick add: 'Netflix $15.99 monthly' or 'Adobe $29/month'..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-500 px-2 text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
