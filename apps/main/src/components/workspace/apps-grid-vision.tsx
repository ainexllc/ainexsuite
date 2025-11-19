'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Lock } from 'lucide-react';
import Link from 'next/link';

// Define the App type based on what we have in the page
export interface VisionApp {
  name: string;
  slug: string;
  description: string;
  icon: React.ElementType;
  color: string; // e.g. "from-purple-500 to-pink-500"
  url: string;
  isInstalled?: boolean;
  isLocked?: boolean;
}

interface AppsGridVisionProps {
  apps: VisionApp[];
}

export function AppsGridVision({ apps }: AppsGridVisionProps) {
  return (
    <div className="relative min-h-[400px] rounded-3xl overflow-hidden w-full">
      {/* Background with Atmosphere - mimicking the mockup's style but integrating with the page's dark theme */}
      <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-3xl"></div>
      
      {/* Content Container */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-wrap gap-8 justify-center">
          {apps.map((app) => (
            <Link href={app.url} key={app.slug} className="no-underline">
              <motion.div 
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className={clsx(
                  "relative w-[88px] h-[88px] rounded-full flex items-center justify-center shadow-2xl border border-white/10 transition-all duration-300",
                  "bg-white/5 backdrop-blur-md group-hover:bg-white/10",
                  !app.isInstalled && "opacity-90 saturate-50"
                )}>
                  {/* Inner Gradient Sphere */}
                  <div className={clsx(
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-inner bg-gradient-to-br",
                    app.color
                  )}>
                     <app.icon className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                  
                  {/* Locked Indicator */}
                  {!app.isInstalled && app.isLocked && (
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <span className={clsx(
                  "text-sm font-medium drop-shadow-md tracking-wide transition-colors",
                  app.isInstalled ? "text-white" : "text-white/60 group-hover:text-white"
                )}>
                  {app.name}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
