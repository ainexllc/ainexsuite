'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Link from 'next/link';

// Define the App type
export interface VisionApp {
  name: string;
  slug: string;
  description: string;
  icon: React.ElementType;
  color?: string; // Hex color for accent (e.g., "#8b5cf6")
  primaryColor?: string; // New: Hex color from Firestore
  secondaryColor?: string; // New: Hex color from Firestore
  url: string;
  isInstalled?: boolean;
  isLocked?: boolean;
}

interface AppsNavVisionProps {
  apps: VisionApp[];
  className?: string;
}

export function AppsNavVision({ apps, className }: AppsNavVisionProps) {
  return (
    <div className={clsx("w-full rounded-xl border border-border bg-background/20 backdrop-blur-xl overflow-hidden", className)}>
      {/* Horizontal scrollable container */}
      <div className="flex items-center gap-3 px-4 py-4 overflow-x-auto scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent">
        {apps.map((app) => {
          const accentColor = app.primaryColor || app.color || '#8b5cf6';

          return (
            <Link
              key={app.slug}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 min-w-[140px] rounded-xl px-3 py-2.5 transition-all duration-300 hover:translate-y-[-2px] overflow-hidden flex-shrink-0"
              style={{
                '--accent': accentColor,
                '--accent-dim': `${accentColor}1a`, // 10% opacity
                '--accent-glow': `${accentColor}40`, // 25% opacity
              } as React.CSSProperties}
            >
              {/* Background & Border Effects */}
              <div className="absolute inset-0 bg-foreground/5 border border-border rounded-xl transition-all duration-300 group-hover:bg-[var(--accent-dim)] group-hover:border-[var(--accent-glow)] group-hover:shadow-[0_0_20px_-5px_var(--accent-glow)]" />

              {/* Icon Container */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-background/40 border border-border transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] flex-shrink-0"
                style={{ color: accentColor }}
              >
                <app.icon className="h-4.5 w-4.5 transition-all duration-300 group-hover:text-background" />
              </motion.div>

              {/* App Name */}
              <span className="relative z-10 text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground truncate">
                {app.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
