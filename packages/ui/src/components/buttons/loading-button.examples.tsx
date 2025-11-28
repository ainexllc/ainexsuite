'use client';

import * as React from 'react';
import { LoadingButton } from './loading-button';

/**
 * LoadingButton Examples
 *
 * Demonstrates various use cases for the LoadingButton component.
 */

export function LoadingButtonExamples() {
  const [loading1, setLoading1] = React.useState(false);
  const [loading2, setLoading2] = React.useState(false);
  const [loading3, setLoading3] = React.useState(false);
  const [loading4, setLoading4] = React.useState(false);

  const simulateAsync = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-12 p-8">
      {/* Basic Usage */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Basic Usage</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButton
            loading={loading1}
            onClick={() => simulateAsync(setLoading1)}
          >
            Submit
          </LoadingButton>

          <LoadingButton
            loading={loading2}
            loadingText="Saving..."
            onClick={() => simulateAsync(setLoading2)}
          >
            Save Changes
          </LoadingButton>
        </div>
      </section>

      {/* Variants */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButton variant="primary" loading={loading1}>
            Primary
          </LoadingButton>

          <LoadingButton variant="secondary" loading={loading1}>
            Secondary
          </LoadingButton>

          <LoadingButton variant="outline" loading={loading1}>
            Outline
          </LoadingButton>

          <LoadingButton variant="ghost" loading={loading1}>
            Ghost
          </LoadingButton>

          <LoadingButton variant="danger" loading={loading1}>
            Danger
          </LoadingButton>

          <LoadingButton variant="accent" loading={loading1}>
            Accent
          </LoadingButton>
        </div>
        <div className="mt-4">
          <LoadingButton
            onClick={() => simulateAsync(setLoading1)}
            variant="primary"
          >
            Toggle Loading State
          </LoadingButton>
        </div>
      </section>

      {/* Sizes */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <LoadingButton size="sm" loading={loading2}>
            Small
          </LoadingButton>

          <LoadingButton size="md" loading={loading2}>
            Medium
          </LoadingButton>

          <LoadingButton size="lg" loading={loading2}>
            Large
          </LoadingButton>
        </div>
        <div className="mt-4">
          <LoadingButton
            onClick={() => simulateAsync(setLoading2)}
            size="sm"
          >
            Toggle Loading State
          </LoadingButton>
        </div>
      </section>

      {/* Spinner Position */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Spinner Position</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButton
            loading={loading3}
            spinnerPosition="left"
            onClick={() => simulateAsync(setLoading3)}
          >
            Spinner Left
          </LoadingButton>

          <LoadingButton
            loading={loading3}
            spinnerPosition="right"
            onClick={() => simulateAsync(setLoading3)}
          >
            Spinner Right
          </LoadingButton>
        </div>
      </section>

      {/* Custom Spinner Size */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Custom Spinner Size</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButton
            loading={loading4}
            spinnerSize="sm"
            onClick={() => simulateAsync(setLoading4)}
          >
            Small Spinner
          </LoadingButton>

          <LoadingButton
            loading={loading4}
            spinnerSize="md"
            onClick={() => simulateAsync(setLoading4)}
          >
            Medium Spinner
          </LoadingButton>

          <LoadingButton
            loading={loading4}
            spinnerSize="lg"
            size="lg"
            onClick={() => simulateAsync(setLoading4)}
          >
            Large Spinner
          </LoadingButton>
        </div>
      </section>

      {/* Real-World Examples */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Real-World Examples</h2>

        <div className="space-y-6">
          {/* Form Submit */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink-600">Form Submission</h3>
            <form
              className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                simulateAsync(setLoading1);
              }}
            >
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-ink-700"
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-ink-700"
              />
              <LoadingButton
                type="submit"
                loading={loading1}
                loadingText="Submitting..."
                className="w-full"
              >
                Submit Form
              </LoadingButton>
            </form>
          </div>

          {/* Delete Action */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink-600">Delete Action</h3>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="mb-4 text-ink-700">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <LoadingButton variant="ghost">Cancel</LoadingButton>
                <LoadingButton
                  variant="danger"
                  loading={loading2}
                  loadingText="Deleting..."
                  onClick={() => simulateAsync(setLoading2)}
                >
                  Delete
                </LoadingButton>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink-600">Save Action</h3>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold text-ink-700">Settings</h4>
                <LoadingButton
                  variant="accent"
                  size="sm"
                  loading={loading3}
                  loadingText="Saving..."
                  onClick={() => simulateAsync(setLoading3)}
                >
                  Save Changes
                </LoadingButton>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-ink-600">Enable notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-ink-600">Email updates</span>
                </label>
              </div>
            </div>
          </div>

          {/* Multiple Actions */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink-600">Multiple Actions</h3>
            <div className="flex flex-wrap gap-3">
              <LoadingButton
                variant="outline"
                loading={loading1}
                loadingText="Processing..."
                onClick={() => simulateAsync(setLoading1)}
              >
                Action 1
              </LoadingButton>
              <LoadingButton
                variant="outline"
                loading={loading2}
                loadingText="Processing..."
                onClick={() => simulateAsync(setLoading2)}
              >
                Action 2
              </LoadingButton>
              <LoadingButton
                variant="outline"
                loading={loading3}
                loadingText="Processing..."
                onClick={() => simulateAsync(setLoading3)}
              >
                Action 3
              </LoadingButton>
            </div>
          </div>
        </div>
      </section>

      {/* Disabled State */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Disabled State</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButton disabled>Disabled</LoadingButton>
          <LoadingButton loading={true} disabled>
            Loading & Disabled
          </LoadingButton>
        </div>
      </section>
    </div>
  );
}

/**
 * Common Patterns
 */

export function FormSubmitButton() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <LoadingButton
        type="submit"
        loading={isSubmitting}
        loadingText="Submitting..."
      >
        Submit
      </LoadingButton>
    </form>
  );
}

export function DeleteConfirmButton() {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsDeleting(false);
  };

  return (
    <LoadingButton
      variant="danger"
      loading={isDeleting}
      loadingText="Deleting..."
      onClick={handleDelete}
    >
      Delete Item
    </LoadingButton>
  );
}

export function SaveButton() {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
  };

  return (
    <LoadingButton
      variant="accent"
      loading={isSaving}
      loadingText="Saving..."
      onClick={handleSave}
    >
      Save Changes
    </LoadingButton>
  );
}
