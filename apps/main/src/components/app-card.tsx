'use client';

import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface AppCardProps {
  app: {
    name: string;
    slug: string;
    description: string;
    icon: LucideIcon;
    color: string;
    url: string;
  };
}

function AppNameWithLogo({ appName }: { appName: string }) {
  const iconSize = 28;
  const fontSize = iconSize * 0.52 + 4;
  const letterSpacing = iconSize * -0.018;
  const xOffset = iconSize * 0.28;
  const yOffset = iconSize * 0.09;

  return (
    <div
      className="flex items-center font-[family-name:var(--font-kanit)] font-semibold"
      style={{ fontSize: `${fontSize}px`, letterSpacing: `${letterSpacing}px` }}
    >
      <span className="text-orange-500">Ai</span>
      <span className="text-ink-900" style={{ paddingRight: '1px' }}>Ne</span>
      <span
        className="relative inline-block"
        style={{
          width: iconSize,
          height: iconSize,
          marginLeft: `-${xOffset}px`,
          transform: `translateY(${yOffset}px)`,
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <rect x="10" y="10" width="15" height="15" fill="#f97316" />
          <rect x="30" y="30" width="15" height="15" fill="#f97316" />
          <rect x="50" y="50" width="15" height="15" fill="#f97316" />
          <rect x="70" y="70" width="15" height="15" fill="#f97316" />
          <rect x="70" y="10" width="15" height="15" fill="#ffffff" />
          <rect x="50" y="30" width="15" height="15" fill="#ffffff" />
          <rect x="30" y="50" width="15" height="15" fill="#ffffff" />
          <rect x="10" y="70" width="15" height="15" fill="#ffffff" />
        </svg>
      </span>
      <span className="text-blue-500 font-[family-name:var(--font-kanit)] font-semibold" style={{ marginLeft: '-8px', transform: 'translateY(2px)' }}>
        {appName}
      </span>
    </div>
  );
}

export function AppCard({ app }: AppCardProps) {
  return (
    <Link
      href={app.url}
      className="group surface-card rounded-xl p-6 hover:scale-105 transition-all duration-200 hover:shadow-xl"
    >
      {/* App Name */}
      <h3 className="mb-2 group-hover:text-accent-500 transition-colors">
        <AppNameWithLogo appName={app.name} />
      </h3>

      {/* Description */}
      <p className="text-sm text-ink-600 mb-4 leading-relaxed">
        {app.description}
      </p>

      {/* Open Button */}
      <div className="flex items-center gap-2 text-sm font-medium text-accent-500 group-hover:gap-3 transition-all">
        <span>Open app</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
