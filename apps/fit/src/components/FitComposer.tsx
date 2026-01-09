'use client';

import { useState } from 'react';
import { Plus, Dumbbell, UtensilsCrossed, Scale, Droplets, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@ainexsuite/auth';

type QuickAction = 'workout' | 'meal' | 'weight' | 'water';

interface FitComposerProps {
  placeholder?: string;
}

/**
 * Composer component for the Fit app workspace.
 * Provides quick actions for logging workouts, meals, water, and weight.
 */
export function FitComposer({ placeholder = 'Log a workout...' }: FitComposerProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickAction = (_action: QuickAction) => {
    // TODO: Implement quick actions - open respective modals
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <section className="w-full">
      <div className="flex w-full items-center gap-2 rounded-xl border border-border/50 px-5 py-4 shadow-xl backdrop-blur-md transition-all bg-foreground/5 hover:bg-foreground/10">
        {/* Quick Log Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-foreground/10 backdrop-blur text-muted-foreground hover:bg-foreground/20 hover:text-foreground hover:border-border hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Log</span>
            <ChevronDown className={clsx('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </button>

          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />
              {/* Dropdown */}
              <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-xl bg-foreground/5 border border-border/50 backdrop-blur-md shadow-2xl overflow-hidden">
                <button
                  onClick={() => handleQuickAction('workout')}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground/80 hover:bg-foreground/10 transition-all"
                >
                  <Dumbbell className="h-4 w-4 text-blue-500" />
                  Log Workout
                </button>
                <button
                  onClick={() => handleQuickAction('meal')}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground/80 hover:bg-foreground/10 transition-all"
                >
                  <UtensilsCrossed className="h-4 w-4 text-green-500" />
                  Log Meal
                </button>
                <button
                  onClick={() => handleQuickAction('weight')}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground/80 hover:bg-foreground/10 transition-all"
                >
                  <Scale className="h-4 w-4 text-purple-500" />
                  Log Weight
                </button>
                <button
                  onClick={() => handleQuickAction('water')}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground/80 hover:bg-foreground/10 transition-all"
                >
                  <Droplets className="h-4 w-4 text-cyan-500" />
                  Log Water
                </button>
              </div>
            </>
          )}
        </div>

        {/* Placeholder text */}
        <span className="flex-1 text-sm text-muted-foreground">{placeholder}</span>
      </div>
    </section>
  );
}
