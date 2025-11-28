/**
 * Loading Components Examples
 *
 * This file demonstrates all loading component variants.
 * Copy these examples to use in your app.
 */

import { Spinner, LoadingOverlay, LoadingDots, PageLoading } from './index';

export function LoadingExamples() {
  return (
    <div className="space-y-12 p-8">
      {/* Spinner Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-ink-900">Spinner</h2>

        <div className="flex items-center gap-8">
          <div className="space-y-2">
            <p className="text-sm text-ink-600">Small</p>
            <Spinner size="sm" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-ink-600">Medium (default)</p>
            <Spinner size="md" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-ink-600">Large</p>
            <Spinner size="lg" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-ink-600">Extra Large</p>
            <Spinner size="xl" />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="space-y-2">
            <p className="text-sm text-ink-600">Accent</p>
            <Spinner color="accent" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-ink-600">Primary</p>
            <Spinner color="primary" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-ink-600">Ink</p>
            <Spinner color="ink" />
          </div>

          <div className="space-y-2 rounded bg-ink-900 p-4">
            <p className="text-sm text-white">White</p>
            <Spinner color="white" />
          </div>
        </div>
      </section>

      {/* Loading Dots Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-ink-900">Loading Dots</h2>

        <div className="flex items-center gap-8">
          <div className="space-y-2">
            <p className="text-sm text-ink-600">Small</p>
            <LoadingDots size="sm" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-ink-600">Medium (default)</p>
            <LoadingDots size="md" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-ink-600">Large</p>
            <LoadingDots size="lg" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-ink-600">Inline with text</p>
          <div className="flex items-center gap-2 text-ink-700">
            <span>Processing</span>
            <LoadingDots size="sm" />
          </div>
        </div>
      </section>

      {/* Loading Overlay Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-ink-900">Loading Overlay</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Parent container overlay */}
          <div className="relative h-48 rounded-2xl border-2 border-dashed border-ink-300 bg-surface-muted p-4">
            <p className="text-sm text-ink-600">Relative container</p>
            <p className="text-xs text-ink-400">Overlay covers parent</p>
            <LoadingOverlay isLoading={true} />
          </div>

          {/* With message */}
          <div className="relative h-48 rounded-2xl border-2 border-dashed border-ink-300 bg-surface-muted p-4">
            <p className="text-sm text-ink-600">With message</p>
            <LoadingOverlay isLoading={true} message="Processing..." />
          </div>

          {/* Without blur */}
          <div className="relative h-48 rounded-2xl border-2 border-dashed border-ink-300 bg-surface-muted p-4">
            <p className="text-sm text-ink-600">Without blur</p>
            <LoadingOverlay isLoading={true} blur={false} />
          </div>

          {/* Custom spinner */}
          <div className="relative h-48 rounded-2xl border-2 border-dashed border-ink-300 bg-surface-muted p-4">
            <p className="text-sm text-ink-600">Custom spinner</p>
            <LoadingOverlay
              isLoading={true}
              message="Please wait..."
              spinnerSize="xl"
              spinnerColor="primary"
            />
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Note:</p>
          <p>For fullScreen overlay, use <code>fullScreen={'{'}true{'}'}</code> to cover the entire viewport.</p>
        </div>
      </section>

      {/* Page Loading Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-ink-900">Page Loading</h2>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-medium">Note:</p>
            <p>PageLoading is typically used as a full-screen component. Examples below are scaled down.</p>
          </div>

          {/* Preview in container */}
          <div className="grid grid-cols-1 gap-4">
            <div className="relative h-64 overflow-hidden rounded-2xl border-2 border-dashed border-ink-300">
              <div className="scale-50">
                <PageLoading message="Loading workspace..." />
              </div>
              <div className="absolute bottom-2 left-2 text-xs text-ink-600">
                Default with gradient
              </div>
            </div>

            <div className="relative h-64 overflow-hidden rounded-2xl border-2 border-dashed border-ink-300">
              <div className="scale-50">
                <PageLoading message="Initializing..." background="solid" />
              </div>
              <div className="absolute bottom-2 left-2 text-xs text-ink-600">
                Solid background
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Code Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-ink-900">Usage Examples</h2>

        <div className="space-y-4">
          <div className="rounded-lg bg-surface-elevated p-4">
            <p className="mb-2 text-sm font-medium text-ink-700">Conditional rendering</p>
            <pre className="overflow-x-auto rounded bg-ink-900 p-3 text-xs text-white">
{`{isLoading ? (
  <Spinner />
) : (
  <YourContent />
)}`}
            </pre>
          </div>

          <div className="rounded-lg bg-surface-elevated p-4">
            <p className="mb-2 text-sm font-medium text-ink-700">Button loading state</p>
            <pre className="overflow-x-auto rounded bg-ink-900 p-3 text-xs text-white">
{`<button disabled={isProcessing}>
  {isProcessing ? (
    <>
      <Spinner size="sm" color="white" />
      <span>Processing...</span>
    </>
  ) : (
    'Submit'
  )}
</button>`}
            </pre>
          </div>

          <div className="rounded-lg bg-surface-elevated p-4">
            <p className="mb-2 text-sm font-medium text-ink-700">Page with overlay</p>
            <pre className="overflow-x-auto rounded bg-ink-900 p-3 text-xs text-white">
{`<div className="relative">
  <YourPageContent />
  <LoadingOverlay
    isLoading={isSaving}
    message="Saving changes..."
  />
</div>`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
