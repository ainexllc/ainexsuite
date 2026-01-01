'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles, Activity, Dumbbell, Target } from 'lucide-react';
import { FitIntegrationWidget } from './fit-integration-widget';
import { HabitsIntegrationWidget } from './habits-integration-widget';
import { WellnessQuickStats } from './wellness-quick-stats';
import { WellnessActivityFeed } from './wellness-activity-feed';
import { WellnessScoreCard } from './wellness-score-card';
import { WellnessAIInsights } from './wellness-ai-insights';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  iconBg,
  iconColor,
  children,
  defaultExpanded = true,
  badge,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-1 group"
      >
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", iconBg)}>
            <div className={iconColor}>{icon}</div>
          </div>
          <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink-400 transition-transform duration-200",
            isExpanded ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      <div className={cn(
        "transition-all duration-200 overflow-hidden",
        isExpanded ? "opacity-100" : "opacity-0 h-0"
      )}>
        {children}
      </div>
    </section>
  );
}

export function WellnessBoard() {
  return (
    <div className="space-y-4">
      {/* Quick Stats Row - Always visible */}
      <WellnessQuickStats />

      {/* AI Insights - Collapsible */}
      <CollapsibleSection
        title="AI Insights"
        icon={<Sparkles className="h-3.5 w-3.5" />}
        iconBg="bg-purple-500/10"
        iconColor="text-purple-500"
        defaultExpanded={true}
      >
        <WellnessAIInsights />
      </CollapsibleSection>

      {/* Main Content - Responsive Grid */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
        {/* Left Column - Score & Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Wellness Score - Collapsible on mobile */}
          <div className="block lg:hidden">
            <CollapsibleSection
              title="Wellness Score"
              icon={<Sparkles className="h-3.5 w-3.5" />}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-500"
              defaultExpanded={true}
            >
              <WellnessScoreCard compact />
            </CollapsibleSection>
          </div>
          <div className="hidden lg:block">
            <WellnessScoreCard />
          </div>

          {/* Activity Feed - Collapsible */}
          <CollapsibleSection
            title="Recent Activity"
            icon={<Activity className="h-3.5 w-3.5" />}
            iconBg="bg-ink-500/10"
            iconColor="text-ink-500"
            defaultExpanded={true}
          >
            <WellnessActivityFeed />
          </CollapsibleSection>
        </div>

        {/* Right Column - Integration Widgets */}
        <div className="space-y-4">
          {/* Fit Integration - Collapsible */}
          <CollapsibleSection
            title="Fitness"
            icon={<Dumbbell className="h-3.5 w-3.5" />}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
            defaultExpanded={true}
          >
            <FitIntegrationWidget />
          </CollapsibleSection>

          {/* Habits Integration - Collapsible */}
          <CollapsibleSection
            title="Habits"
            icon={<Target className="h-3.5 w-3.5" />}
            iconBg="bg-teal-500/10"
            iconColor="text-teal-500"
            defaultExpanded={true}
          >
            <HabitsIntegrationWidget />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
