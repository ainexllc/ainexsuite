'use client';

import { ProgressBar } from '../../components/progress/progress-bar';
import { ProgressRing } from '../../components/progress/progress-ring';
import { Spinner } from '../../components/loading/spinner';

export function ProgressSection() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">ProgressBar Sizes</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Small (65%)</p>
            <ProgressBar value={65} size="sm" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Medium (65%)</p>
            <ProgressBar value={65} size="md" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Large (65%)</p>
            <ProgressBar value={65} size="lg" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">ProgressBar Variants</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Default (45%)</p>
            <ProgressBar value={45} variant="default" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Gradient (45%)</p>
            <ProgressBar value={45} variant="gradient" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Striped (45%)</p>
            <ProgressBar value={45} variant="striped" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">ProgressBar Indeterminate</h3>
        <ProgressBar indeterminate />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">ProgressRing</h3>
        <div className="flex flex-wrap gap-8 items-center">
          <div className="text-center">
            <ProgressRing value={75} size={60} />
            <p className="text-sm text-muted-foreground mt-2">60px (75%)</p>
          </div>
          <div className="text-center">
            <ProgressRing value={50} size={80} />
            <p className="text-sm text-muted-foreground mt-2">80px (50%)</p>
          </div>
          <div className="text-center">
            <ProgressRing value={90} size={100} />
            <p className="text-sm text-muted-foreground mt-2">100px (90%)</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Spinner</h3>
        <div className="flex flex-wrap gap-8 items-center">
          <div className="text-center">
            <Spinner size="sm" />
            <p className="text-sm text-muted-foreground mt-2">Small</p>
          </div>
          <div className="text-center">
            <Spinner size="md" />
            <p className="text-sm text-muted-foreground mt-2">Medium</p>
          </div>
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground mt-2">Large</p>
          </div>
          <div className="text-center">
            <Spinner size="xl" />
            <p className="text-sm text-muted-foreground mt-2">Extra Large</p>
          </div>
        </div>
      </div>
    </div>
  );
}
