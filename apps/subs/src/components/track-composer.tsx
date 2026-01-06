"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  Repeat,
  X,
  Loader2,
  Plus
} from "lucide-react";
import { useSubscriptions } from "@/components/providers/subscription-provider";
import type { BillingCycle } from "@/types";
import { InlineSpacePicker } from "@ainexsuite/ui";
import { useSpaces } from "@/components/providers/spaces-provider";
import { Hint, HINTS } from "@/components/hints";

// Define props to match NoteComposer structure, allowing parent to handle modal opens
interface TrackComposerProps {
  onManagePeople?: () => void;
  onManageSpaces?: () => void;
}

export function TrackComposer({ onManagePeople, onManageSpaces }: TrackComposerProps) {
  const { createSubscription } = useSubscriptions();
  const { spaces, currentSpace, setCurrentSpace } = useSpaces();
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [inputValue, setInputValue] = useState("");
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [nextPayment, setNextPayment] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const composerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if user only has personal space (for hint display)
  const hasOnlyPersonalSpace = spaces.length === 1 && spaces[0]?.type === 'personal';

  // Smart Parsing Logic
  const parseInput = useCallback((text: string) => {
    const lower = text.toLowerCase();
    
    // Extract cost
    const costMatch = text.match(/\$(\d+(\.\d{2})?)/) || text.match(/(\d+(\.\d{2})?)/);
    let extractedCost = "";
    let extractedName = text;
    
    if (costMatch) {
      extractedCost = costMatch[1];
      extractedName = extractedName.replace(costMatch[0], "").replace("$", "").trim();
    }
    
    // Extract cycle
    let extractedCycle: BillingCycle = "monthly";
    if (lower.includes("yearly") || lower.includes("year") || lower.includes("annual")) {
      extractedCycle = "yearly";
      extractedName = extractedName.replace(/yearly|year|annual/gi, "").trim();
    } else if (lower.includes("monthly") || lower.includes("month")) {
      extractedCycle = "monthly";
      extractedName = extractedName.replace(/monthly|month/gi, "").trim();
    } else if (lower.includes("weekly") || lower.includes("week")) {
      extractedCycle = "weekly";
      extractedName = extractedName.replace(/weekly|week/gi, "").trim();
    }
    
    extractedName = extractedName.replace(/\s+/g, " ").trim();
    
    return {
      name: extractedName,
      cost: extractedCost,
      cycle: extractedCycle
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const parsed = parseInput(val);
    if (parsed.cost && val.includes('$')) {
      setName(parsed.name);
      setCost(parsed.cost);
      setCycle(parsed.cycle);
    } else {
      setName(val);
    }
  };

  const handleClose = useCallback(() => {
    setExpanded(false);
    setInputValue("");
    setName("");
    setCost("");
    setCycle("monthly");
    setNextPayment(new Date().toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Determine spaceId: "personal" means no spaceId (null/undefined) in DB
      const spaceId = currentSpace.type === 'personal' ? null : currentSpace.id;

      await createSubscription({
        name: name.trim(),
        cost: parseFloat(cost) || 0,
        billingCycle: cycle,
        nextPaymentDate: new Date(nextPayment).toISOString(),
        startDate: new Date().toISOString(),
        currency: "USD",
        status: "active",
        category: "Uncategorized",
        color: "default",
        spaceId: spaceId || undefined
      });
      handleClose();
    } catch (error) {
      console.error("Failed to create subscription:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    if (!expanded) return;
    const handlePointerDown = (event: PointerEvent) => {
      // Don't close if clicking inside the composer or space picker logic (if it portals)
      // For now, standard check
      if (composerRef.current && !composerRef.current.contains(event.target as Node)) {
        // We can add logic to ignore portal clicks if needed, 
        // but typically simple click outside is enough.
        handleClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [expanded, handleClose]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {!expanded ? (
        <Hint hint={HINTS.SHARED_NOTES} showWhen={hasOnlyPersonalSpace}>
          <div className="flex w-full items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm transition bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
            <button
              type="button"
              className="flex-1 min-w-0 text-left text-sm text-zinc-500 dark:text-zinc-400 focus-visible:outline-none flex items-center gap-2"
              onClick={() => {
                setExpanded(true);
                // focus handled in expanded view effect or autoFocus
              }}
            >
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <span>Add a subscription... (e.g. Netflix $15)</span>
            </button>
            {/* Compact space selector */}
            <InlineSpacePicker
              spaces={spaces}
              currentSpace={currentSpace}
              onSpaceChange={setCurrentSpace}
              onManagePeople={onManagePeople}
              onManageSpaces={onManageSpaces}
            />
          </div>
        </Hint>
      ) : (
        <div 
          ref={composerRef}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden transition-all"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              {/* Top Row: Name Input */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                   <Sparkles className="h-5 w-5" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Subscription name (e.g. Netflix)"
                  className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-zinc-400 dark:text-white"
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Middle Row: Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Cost */}
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <span className="text-zinc-500 text-sm">$</span>
                   </div>
                   <input
                     type="number"
                     step="0.01"
                     value={cost}
                     onChange={(e) => setCost(e.target.value)}
                     placeholder="0.00"
                     className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl py-2 pl-7 pr-3 text-sm outline-none focus:border-emerald-500/50 transition-colors"
                   />
                </div>

                {/* Cycle */}
                <div className="relative">
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value as BillingCycle)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl py-2 pl-3 pr-8 text-sm outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <Repeat className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>

                {/* Date */}
                <div className="relative">
                  <input
                    type="date"
                    value={nextPayment}
                    onChange={(e) => setNextPayment(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl py-2 pl-3 pr-3 text-sm outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Subscription
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}