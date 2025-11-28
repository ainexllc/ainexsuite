'use client';

import * as React from 'react';
import { LoadingSkeleton } from './loading-skeleton';

/**
 * LoadingSkeleton Examples
 *
 * Demonstrates various use cases for the LoadingSkeleton component.
 */

export function LoadingSkeletonExamples() {
  return (
    <div className="space-y-12 p-8">
      {/* Text Skeletons */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Text Skeletons</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-ink-600">Single line</p>
            <LoadingSkeleton variant="text" width="80%" />
          </div>

          <div>
            <p className="mb-2 text-sm text-ink-600">Multiple lines</p>
            <LoadingSkeleton variant="text" lines={3} />
          </div>

          <div>
            <p className="mb-2 text-sm text-ink-600">Paragraph (5 lines)</p>
            <LoadingSkeleton variant="text" lines={5} width="100%" />
          </div>
        </div>
      </section>

      {/* Shapes */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Shapes</h2>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="mb-2 text-sm text-ink-600">Circle (default)</p>
            <LoadingSkeleton variant="circle" />
          </div>

          <div>
            <p className="mb-2 text-sm text-ink-600">Large Circle</p>
            <LoadingSkeleton variant="circle" width={80} height={80} />
          </div>

          <div>
            <p className="mb-2 text-sm text-ink-600">Avatar</p>
            <LoadingSkeleton variant="avatar" />
          </div>

          <div>
            <p className="mb-2 text-sm text-ink-600">Large Avatar</p>
            <LoadingSkeleton variant="avatar" width={64} height={64} />
          </div>
        </div>
      </section>

      {/* Rectangles */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Rectangles</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-ink-600">Default rectangle</p>
            <LoadingSkeleton variant="rect" />
          </div>

          <div>
            <p className="mb-2 text-sm text-ink-600">Custom size</p>
            <LoadingSkeleton variant="rect" width="300px" height="150px" />
          </div>

          <div>
            <p className="mb-2 text-sm text-ink-600">Banner</p>
            <LoadingSkeleton variant="rect" width="100%" height="200px" />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Cards</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </div>
      </section>

      {/* Composite Layouts */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Composite Layouts</h2>

        {/* Profile Card */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-ink-600">Profile Card</p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-4">
              <LoadingSkeleton variant="avatar" width={64} height={64} />
              <div className="flex-1 space-y-3">
                <LoadingSkeleton variant="text" width="40%" />
                <LoadingSkeleton variant="text" width="60%" />
              </div>
            </div>
          </div>
        </div>

        {/* Article Preview */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-ink-600">Article Preview</p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <LoadingSkeleton variant="rect" height="200px" className="mb-4" />
            <LoadingSkeleton variant="text" width="80%" className="mb-3" />
            <LoadingSkeleton variant="text" lines={3} />
          </div>
        </div>

        {/* Comment List */}
        <div>
          <p className="mb-2 text-sm text-ink-600">Comment List</p>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex gap-3">
                  <LoadingSkeleton variant="avatar" width={40} height={40} />
                  <div className="flex-1 space-y-2">
                    <LoadingSkeleton variant="text" width="30%" />
                    <LoadingSkeleton variant="text" lines={2} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Without Animation */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Without Animation</h2>
        <div className="space-y-4">
          <LoadingSkeleton variant="text" width="80%" animate={false} />
          <LoadingSkeleton variant="rect" height="100px" animate={false} />
          <LoadingSkeleton variant="circle" animate={false} />
        </div>
      </section>

      {/* Custom Styling */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-700">Custom Styling</h2>
        <div className="space-y-4">
          <LoadingSkeleton
            variant="rect"
            height="100px"
            className="bg-accent-500/20"
          />
          <LoadingSkeleton
            variant="text"
            lines={3}
            className="bg-primary-500/20"
          />
          <LoadingSkeleton
            variant="circle"
            width={100}
            height={100}
            className="border-4 border-accent-500/30"
          />
        </div>
      </section>
    </div>
  );
}

/**
 * Realistic Use Cases
 */

export function ProfileCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-4">
        <LoadingSkeleton variant="avatar" width={64} height={64} />
        <div className="flex-1 space-y-3">
          <LoadingSkeleton variant="text" width="40%" />
          <LoadingSkeleton variant="text" width="60%" />
          <LoadingSkeleton variant="text" width="50%" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <LoadingSkeleton variant="text" lines={3} />
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {/* Featured Image */}
      <LoadingSkeleton variant="card" height="300px" className="mb-6" />

      {/* Title */}
      <LoadingSkeleton variant="text" width="80%" className="mb-4" />

      {/* Meta info */}
      <div className="mb-6 flex items-center gap-4">
        <LoadingSkeleton variant="circle" width={32} height={32} />
        <LoadingSkeleton variant="text" width="150px" />
        <LoadingSkeleton variant="text" width="100px" />
      </div>

      {/* Content */}
      <LoadingSkeleton variant="text" lines={8} />
    </article>
  );
}

export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <LoadingSkeleton variant="text" width="100px" />
            <LoadingSkeleton variant="circle" width={40} height={40} />
          </div>
          <LoadingSkeleton variant="text" width="60%" className="mb-2" />
          <LoadingSkeleton variant="text" width="80%" />
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <LoadingSkeleton variant="circle" width={40} height={40} />
          <LoadingSkeleton variant="text" width="30%" />
          <LoadingSkeleton variant="text" width="20%" />
          <LoadingSkeleton variant="text" width="15%" />
          <div className="flex-1" />
          <LoadingSkeleton variant="rect" width="80px" height="32px" />
        </div>
      ))}
    </div>
  );
}
