'use client';

import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropOverlayProps {
  isDragActive: boolean;
}

export function ImageDropOverlay({ isDragActive }: ImageDropOverlayProps) {
  if (!isDragActive) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-orange-500/10 dark:bg-orange-400/10 backdrop-blur-sm" />
      <div className="absolute inset-4 border-2 border-dashed border-orange-500 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto text-orange-600 dark:text-orange-400 mb-3" />
          <p className="text-lg font-medium text-orange-700 dark:text-orange-300">
            Drop image here to upload
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
            Images will be compressed and optimized
          </p>
        </div>
      </div>
    </div>
  );
}
