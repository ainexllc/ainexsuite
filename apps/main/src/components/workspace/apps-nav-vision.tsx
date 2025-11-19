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
  color?: string; // Legacy: e.g. "from-purple-500 to-pink-500"
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
  // In the main dashboard, we don't necessarily have an "active" state for these 
  // because clicking them takes you to a different subdomain. 
  // However, we could highlight 'dashboard' if we had one in the list.
  
  return (
    <div className={clsx("w-full border-b border-white/5 bg-black/20 backdrop-blur-sm z-20", className)}>
        {/* Scrollable Container */}
        <div className="flex items-start justify-center gap-2 px-4 py-4 w-full max-w-[1440px] mx-auto flex-wrap min-[830px]:flex-nowrap">
          {apps.map((app) => (
            <Link 
              key={app.slug}
              href={app.url}
              className="group flex flex-col items-center gap-2 min-w-[72px] pb-2 outline-none no-underline"
            >
              {/* Glass Icon Container */}
              <motion.div 
                 whileHover={{ y: -4 }}
                 whileTap={{ scale: 0.95 }}
                 className={clsx(
                   "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                   "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg",
                   "group-hover:bg-white/10 group-hover:border-white/20",
                   !app.isInstalled && "opacity-80 saturate-50"
                 )}
              >
                {/* Inner Sphere */}
                <div
                  className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                    !app.primaryColor && "bg-gradient-to-br",
                    !app.primaryColor && app.color
                  )}
                  style={
                    app.primaryColor
                      ? { backgroundColor: app.primaryColor }
                      : undefined
                  }
                >
                   <app.icon className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              </motion.div>

              {/* App Name */}
              <span className={clsx(
                "text-[11px] font-medium tracking-wide transition-colors duration-200",
                app.isInstalled ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-gray-400"
              )}>
                {app.name}
              </span>
            </Link>
          ))}
        </div>
    </div>
  );
}
