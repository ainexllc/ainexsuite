'use client';

import { Spinner } from '../../components/loading/spinner';
import { LoadingSkeleton } from '../../components/loading/loading-skeleton';
import { LoadingDots } from '../../components/loading/loading-dots';

export function LoadingSection() {
  return (
    <div className="space-y-8">
      {/* Spinner Sizes */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Spinner Sizes</h4>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="sm" />
            <span className="text-xs text-muted-foreground">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <span className="text-xs text-muted-foreground">Large</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="xl" />
            <span className="text-xs text-muted-foreground">Extra Large</span>
          </div>
        </div>
      </div>

      {/* Spinner Colors */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Spinner Colors</h4>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Spinner color="accent" />
            <span className="text-xs text-muted-foreground">Accent</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner color="primary" />
            <span className="text-xs text-muted-foreground">Primary</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner color="ink" />
            <span className="text-xs text-muted-foreground">Ink</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 rounded-xl bg-ink-500">
              <Spinner color="white" />
            </div>
            <span className="text-xs text-muted-foreground">White</span>
          </div>
        </div>
      </div>

      {/* Loading Dots Sizes */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Loading Dots Sizes</h4>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <LoadingDots size="sm" />
            <span className="text-xs text-muted-foreground">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingDots size="md" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingDots size="lg" />
            <span className="text-xs text-muted-foreground">Large</span>
          </div>
        </div>
      </div>

      {/* Loading Dots Colors */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Loading Dots Colors</h4>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <LoadingDots color="accent" />
            <span className="text-xs text-muted-foreground">Accent</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingDots color="primary" />
            <span className="text-xs text-muted-foreground">Primary</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingDots color="ink" />
            <span className="text-xs text-muted-foreground">Ink</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 rounded-xl bg-ink-500">
              <LoadingDots color="white" />
            </div>
            <span className="text-xs text-muted-foreground">White</span>
          </div>
        </div>
      </div>

      {/* Loading Skeleton Variants */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Loading Skeleton Variants</h4>
        <div className="space-y-6 max-w-2xl">
          {/* Text Lines */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Text Lines</h5>
            <div className="space-y-2">
              <LoadingSkeleton variant="text" width="100%" />
              <LoadingSkeleton variant="text" width="95%" />
              <LoadingSkeleton variant="text" width="88%" />
            </div>
          </div>

          {/* Multiple Lines */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Multiple Lines</h5>
            <LoadingSkeleton variant="text" lines={4} />
          </div>

          {/* Avatar */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Avatar</h5>
            <div className="flex items-center gap-4">
              <LoadingSkeleton variant="avatar" width={40} height={40} />
              <LoadingSkeleton variant="avatar" width={48} height={48} />
              <LoadingSkeleton variant="avatar" width={64} height={64} />
            </div>
          </div>

          {/* Circle */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Circle (Badges/Icons)</h5>
            <div className="flex items-center gap-4">
              <LoadingSkeleton variant="circle" width={24} height={24} />
              <LoadingSkeleton variant="circle" width={32} height={32} />
              <LoadingSkeleton variant="circle" width={48} height={48} />
            </div>
          </div>

          {/* Rectangle */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Rectangle</h5>
            <div className="space-y-3">
              <LoadingSkeleton variant="rect" width="100%" height={80} />
              <LoadingSkeleton variant="rect" width="60%" height={120} />
            </div>
          </div>

          {/* Card */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Card</h5>
            <div className="grid grid-cols-2 gap-4">
              <LoadingSkeleton variant="card" height={200} />
              <LoadingSkeleton variant="card" height={200} />
            </div>
          </div>

          {/* Complex Layout Example */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Complex Layout (User Profile)</h5>
            <div className="space-y-4 p-6 rounded-2xl bg-surface/50 border border-outline-subtle">
              <div className="flex items-center gap-4">
                <LoadingSkeleton variant="avatar" width={64} height={64} />
                <div className="flex-1 space-y-2">
                  <LoadingSkeleton variant="text" width="40%" height={20} />
                  <LoadingSkeleton variant="text" width="60%" height={16} />
                </div>
              </div>
              <LoadingSkeleton variant="rect" width="100%" height={100} />
              <div className="space-y-2">
                <LoadingSkeleton variant="text" width="100%" />
                <LoadingSkeleton variant="text" width="95%" />
                <LoadingSkeleton variant="text" width="80%" />
              </div>
            </div>
          </div>

          {/* Without Animation */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Without Animation</h5>
            <div className="space-y-2">
              <LoadingSkeleton variant="text" width="100%" animate={false} />
              <LoadingSkeleton variant="text" width="90%" animate={false} />
              <LoadingSkeleton variant="text" width="75%" animate={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
