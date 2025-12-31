"use client";

import { clsx } from "clsx";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-surface-muted/50",
        className
      )}
    />
  );
}

export function WelcomeHeaderSkeleton() {
  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 sm:h-9" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function DailyFocusSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-12" />
      </div>

      {/* Focus items */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-4"
          >
            <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppsQuickAccessSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-24" />

      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-outline-subtle/40 bg-surface-elevated/50 p-4 min-w-[100px]"
          >
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SmartGridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-4"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SuiteInsightsSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-subtle/40 bg-surface-elevated/50 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 py-4">
      {/* Welcome Header */}
      <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <WelcomeHeaderSkeleton />
      </section>

      {/* Daily Focus */}
      <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <DailyFocusSkeleton />
      </section>

      {/* AI Insights */}
      <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <SuiteInsightsSkeleton />
      </section>

      {/* Apps Quick Access */}
      <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <AppsQuickAccessSkeleton />
      </section>

      {/* Smart Grid */}
      <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <SmartGridSkeleton />
      </section>
    </div>
  );
}
