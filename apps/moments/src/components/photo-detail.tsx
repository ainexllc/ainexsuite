'use client';

import type { Moment } from '@ainexsuite/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { X, MapPin, Calendar, Edit } from 'lucide-react';

interface PhotoDetailProps {
  moment: Moment;
  onClose: () => void;
  onEdit: () => void;
}

export function PhotoDetail({ moment, onClose, onEdit }: PhotoDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      <button
        onClick={onEdit}
        className="absolute top-4 right-20 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        <Edit className="h-6 w-6 text-white" />
      </button>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center justify-center">
          <div className="relative w-full max-h-[80vh] aspect-[4/3]">
            <Image
              src={moment.photoUrl}
              alt={moment.caption || 'Moment'}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-contain rounded-lg shadow-2xl"
              priority
              unoptimized
            />
          </div>
        </div>

        <div className="surface-card rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {moment.title || moment.caption || 'Untitled Moment'}
            </h2>

            {moment.caption && moment.title && (
              <p className="text-ink-700 mb-4">{moment.caption}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-ink-700">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(moment.date), 'MMMM d, yyyy')}</span>
              </div>

              {moment.location && (
                <div className="flex items-center gap-2 text-ink-700">
                  <MapPin className="h-4 w-4" />
                  <span>{moment.location}</span>
                </div>
              )}
            </div>
          </div>

          {moment.tags && moment.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-ink-600 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {moment.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 surface-elevated rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-surface-hover">
            <p className="text-xs text-ink-600">
              Added {format(new Date(moment.createdAt), 'MMM d, yyyy')}
            </p>
            {moment.updatedAt && moment.updatedAt !== moment.createdAt && (
              <p className="text-xs text-ink-600 mt-1">
                Updated {format(new Date(moment.updatedAt), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
