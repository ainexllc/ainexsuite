'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export interface NotFoundProps {
  /** App display name */
  appName?: string;
  /** Where to redirect - defaults to /workspace */
  homeHref?: string;
  /** Optional accent color class (e.g., "text-orange-500") */
  accentClass?: string;
  /** Optional message override */
  message?: string;
}

export function NotFound({
  appName,
  homeHref = '/workspace',
  accentClass = 'text-primary',
  message = "The page you're looking for doesn't exist or has been moved.",
}: NotFoundProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 ${accentClass.replace('text-', 'bg-')}`}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-foreground/20"
        />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Abstract illustration - wandering path */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-32 h-32">
            {/* Animated circles representing a lost journey */}
            <div className={`absolute inset-0 rounded-full border-2 border-dashed ${accentClass.replace('text-', 'border-')} opacity-30 animate-[spin_20s_linear_infinite]`} />
            <div className={`absolute inset-4 rounded-full border-2 border-dashed border-foreground/20 animate-[spin_15s_linear_infinite_reverse]`} />
            <div className={`absolute inset-8 rounded-full border-2 border-dashed ${accentClass.replace('text-', 'border-')} opacity-50 animate-[spin_10s_linear_infinite]`} />

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full ${accentClass.replace('text-', 'bg-')} animate-pulse`} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Page not found
          </h1>

          <p className="text-muted-foreground text-balance leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={homeHref}
            className={`
              inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
              font-medium text-sm transition-all
              ${accentClass.replace('text-', 'bg-')} text-white
              hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]
              shadow-lg shadow-black/10
            `}
          >
            <Home className="w-4 h-4" />
            {appName ? `Back to ${appName}` : 'Go home'}
          </Link>

          <button
            onClick={() => window.history.back()}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
              font-medium text-sm transition-all
              text-muted-foreground hover:text-foreground
              hover:bg-foreground/5 active:bg-foreground/10
            "
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>

        {/* Subtle footer */}
        <p className="mt-12 text-xs text-muted-foreground/60">
          Lost? Try using the navigation or search.
        </p>
      </div>
    </div>
  );
}
