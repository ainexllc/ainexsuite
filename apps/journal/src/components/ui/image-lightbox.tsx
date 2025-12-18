'use client';

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, Download, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  caption?: string;
}

export function ImageLightbox({ isOpen, onClose, src, alt, caption }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === '+' || e.key === '=') setScale(s => Math.min(3, s + 0.25));
    if (e.key === '-') setScale(s => Math.max(0.5, s - 0.25));
    if (e.key === 'r') setRotation(r => (r + 90) % 360);
    if (e.key === '0') {
      setScale(1);
      setRotation(0);
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closing
      setScale(1);
      setRotation(0);
      return;
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(s => Math.min(3, s + 0.25));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(s => Math.max(0.5, s - 0.25));
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation(r => (r + 90) % 360);
  };

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span className="text-white/50 text-sm mr-2">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomOut}
          className={cn(
            'p-2.5 rounded-full transition-all',
            'bg-white/10 text-white hover:bg-white/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          disabled={scale <= 0.5}
          title="Zoom out (-)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomIn}
          className={cn(
            'p-2.5 rounded-full transition-all',
            'bg-white/10 text-white hover:bg-white/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          disabled={scale >= 3}
          title="Zoom in (+)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleRotate}
          className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          title="Rotate (R)"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 text-white hover:bg-red-500/80 transition-all"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 left-4 text-white/30 text-xs space-x-4">
        <span>+/- Zoom</span>
        <span>R Rotate</span>
        <span>0 Reset</span>
        <span>Esc Close</span>
      </div>

      {/* Image container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ''}
          className="max-w-full max-h-[85vh] object-contain transition-transform duration-200 select-none"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
          draggable={false}
        />

        {/* Caption */}
        {caption && (
          <div className="absolute -bottom-12 left-0 right-0 text-center">
            <p className="text-white/80 text-sm bg-black/50 rounded-full px-4 py-2 inline-block backdrop-blur-sm">
              {caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
