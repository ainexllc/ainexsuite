'use client';

import { SmartGrid } from '@/components/smart-dashboard/smart-grid';
import { MarketingSlideshow } from '@/components/workspace/marketing-slideshow';
import { WorkspacePageLayout } from '@ainexsuite/ui/components';

export default function WorkspacePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Marketing Slideshow - App-specific feature */}
      <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto">
        <MarketingSlideshow />
      </section>

      {/* Standardized Workspace Layout */}
      <WorkspacePageLayout
        maxWidth="wide"
        insightsBanner={
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">AI Insights</h3>
            <div className="rounded-xl border border-border bg-foreground/5 backdrop-blur p-6 min-h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">AI insights coming soon...</p>
            </div>
          </section>
        }
      >
        {/* Smart Dashboard Grid */}
        <SmartGrid />
      </WorkspacePageLayout>
    </div>
  );
}
