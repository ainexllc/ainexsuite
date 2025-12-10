'use client';

import { SmartGrid } from '@/components/smart-dashboard/smart-grid';
import { SuiteInsights } from '@/components/smart-dashboard/suite-insights';
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
        insightsBanner={<SuiteInsights />}
      >
        {/* Smart Dashboard Grid */}
        <SmartGrid />
      </WorkspacePageLayout>
    </div>
  );
}
