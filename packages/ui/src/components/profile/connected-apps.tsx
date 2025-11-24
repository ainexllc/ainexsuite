'use client';

import { ExternalLink, Lock } from 'lucide-react';
import Link from 'next/link';

export interface App {
  name: string;
  slug: string;
  color: string;
  icon?: React.ComponentType<{ className?: string }>;
  url: string;
}

export interface ConnectedAppsProps {
  apps: App[];
  accessibleApps?: string[]; // Array of app slugs user has access to
  onClose?: () => void;
}

export function ConnectedApps({ apps, accessibleApps = [], onClose }: ConnectedAppsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
        Your Apps ({accessibleApps.length}/{apps.length})
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {apps.map((app) => {
          const hasAccess = accessibleApps.includes(app.slug);
          const IconComponent = app.icon;

          return (
            <Link
              key={app.slug}
              href={hasAccess ? app.url : '/pricing'}
              onClick={onClose}
              className={`group relative flex items-center gap-2 p-3 rounded-lg border transition ${
                hasAccess
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  : 'bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* App Icon/Color Indicator */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: hasAccess ? `${app.color}20` : 'rgba(255,255,255,0.05)',
                  color: hasAccess ? app.color : 'rgba(255,255,255,0.3)',
                }}
              >
                {IconComponent ? (
                  <IconComponent className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">
                    {app.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* App Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  hasAccess ? 'text-white' : 'text-white/40'
                }`}>
                  {app.name}
                </p>
              </div>

              {/* Status Indicator */}
              {hasAccess ? (
                <ExternalLink className="h-3 w-3 text-white/40 group-hover:text-white/60 transition flex-shrink-0" />
              ) : (
                <Lock className="h-3 w-3 text-white/30 flex-shrink-0" />
              )}

              {/* Locked Overlay */}
              {!hasAccess && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  <span className="text-xs font-medium text-white">Upgrade</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Upgrade CTA if user doesn't have all apps */}
      {accessibleApps.length < apps.length && (
        <Link
          href="/pricing"
          onClick={onClose}
          className="block text-center text-xs font-medium text-blue-400 hover:text-blue-300 transition pt-2"
        >
          Unlock all {apps.length} apps →
        </Link>
      )}
    </div>
  );
}
