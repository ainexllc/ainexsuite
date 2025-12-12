'use client';

import { ReactNode } from 'react';

interface ShowcaseContainerProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function ShowcaseContainer({ id, title, children }: ShowcaseContainerProps) {
  return (
    <section id={id} className="border-b border-border scroll-mt-20">
      {/* Section Header */}
      <div className="bg-muted/30 px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>

      {/* Split-Screen Container */}
      <div className="grid grid-cols-2 min-h-[400px]">
        {/* Light Mode Panel */}
        <div className="light bg-[rgb(250,251,252)] p-6 border-r border-border overflow-auto">
          <div className="mb-4 px-3 py-1 bg-gray-200 rounded-full w-fit">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Light Mode
            </span>
          </div>
          <div className="space-y-6">
            {children}
          </div>
        </div>

        {/* Dark Mode Panel */}
        <div className="dark bg-[rgb(20,20,22)] p-6 overflow-auto">
          <div className="mb-4 px-3 py-1 bg-gray-800 rounded-full w-fit">
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
              Dark Mode
            </span>
          </div>
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
