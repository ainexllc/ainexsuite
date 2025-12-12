'use client';

import { Info, CheckCircle, XCircle, AlertTriangle, Bell } from 'lucide-react';

export function ToastsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Toast Variants</h4>
        <div className="space-y-4 max-w-md">
          {/* Default Toast */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-outline-subtle shadow-lg">
            <div className="flex-shrink-0 mt-0.5">
              <Bell className="h-5 w-5 text-ink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Default Notification</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                This is a default toast message for general notifications.
              </div>
            </div>
            <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <XCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Success Toast */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-green-500/30 shadow-lg">
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Success</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                Your changes have been saved successfully.
              </div>
            </div>
            <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <XCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Error Toast */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-red-500/30 shadow-lg">
            <div className="flex-shrink-0 mt-0.5">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Error</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                Something went wrong. Please try again.
              </div>
            </div>
            <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <XCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Warning Toast */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-amber-500/30 shadow-lg">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Warning</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                Your session will expire in 5 minutes.
              </div>
            </div>
            <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <XCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Info Toast */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-blue-500/30 shadow-lg">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Information</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                A new version of the app is available.
              </div>
            </div>
            <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Note</h4>
        <p className="text-sm text-muted-foreground max-w-md">
          These are static visual representations of toast components. In production, toasts would be triggered programmatically and animate in/out of view.
        </p>
      </div>
    </div>
  );
}
