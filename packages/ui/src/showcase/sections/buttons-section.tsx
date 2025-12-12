'use client';

import { Button } from '../../components/buttons/button';
import { LoadingButton } from '../../components/buttons/loading-button';
import { useState } from 'react';

export function ButtonsSection() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Variants</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Sizes</h4>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">States</h4>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">LoadingButton</h4>
        <div className="flex flex-wrap gap-3">
          <LoadingButton
            loading={loadingStates['loading1']}
            onClick={() => toggleLoading('loading1')}
          >
            Click to Toggle
          </LoadingButton>
          <LoadingButton
            loading={loadingStates['loading2']}
            loadingText="Saving..."
            onClick={() => toggleLoading('loading2')}
          >
            Save Changes
          </LoadingButton>
          <LoadingButton
            variant="secondary"
            loading={loadingStates['loading3']}
            spinnerPosition="right"
            onClick={() => toggleLoading('loading3')}
          >
            Submit
          </LoadingButton>
          <LoadingButton
            variant="danger"
            loading={loadingStates['loading4']}
            loadingText="Deleting..."
            onClick={() => toggleLoading('loading4')}
          >
            Delete
          </LoadingButton>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">App-Themed Buttons</h4>
        <p className="text-xs text-muted-foreground mb-3">Using dynamic app color via var(--color-primary)</p>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center justify-center rounded-lg font-medium h-10 px-4 text-base bg-[var(--color-primary,#f97316)] text-white hover:brightness-110 shadow-lg transition-all">
            App Primary
          </button>
          <button className="inline-flex items-center justify-center rounded-lg font-medium h-10 px-4 text-base border-2 border-[var(--color-primary,#f97316)] text-[var(--color-primary,#f97316)] hover:bg-[var(--color-primary,#f97316)] hover:text-white transition-all">
            App Outline
          </button>
          <button className="inline-flex items-center justify-center rounded-lg font-medium h-10 px-4 text-base text-[var(--color-primary,#f97316)] hover:bg-[var(--color-primary,#f97316)]/10 transition-all">
            App Ghost
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Complete Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-outline-subtle">
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Variant</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Small</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Medium</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Large</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-outline-subtle">
                <td className="py-3 px-3 text-sm">Primary</td>
                <td className="py-3 px-3">
                  <Button variant="primary" size="sm">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="primary" size="md">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="primary" size="lg">Button</Button>
                </td>
              </tr>
              <tr className="border-b border-outline-subtle">
                <td className="py-3 px-3 text-sm">Secondary</td>
                <td className="py-3 px-3">
                  <Button variant="secondary" size="sm">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="secondary" size="md">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="secondary" size="lg">Button</Button>
                </td>
              </tr>
              <tr className="border-b border-outline-subtle">
                <td className="py-3 px-3 text-sm">Outline</td>
                <td className="py-3 px-3">
                  <Button variant="outline" size="sm">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="outline" size="md">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="outline" size="lg">Button</Button>
                </td>
              </tr>
              <tr className="border-b border-outline-subtle">
                <td className="py-3 px-3 text-sm">Ghost</td>
                <td className="py-3 px-3">
                  <Button variant="ghost" size="sm">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="ghost" size="md">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="ghost" size="lg">Button</Button>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 text-sm">Danger</td>
                <td className="py-3 px-3">
                  <Button variant="danger" size="sm">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="danger" size="md">Button</Button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="danger" size="lg">Button</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
