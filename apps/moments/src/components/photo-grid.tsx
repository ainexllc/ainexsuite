'use client';

import type { Moment } from '@ainexsuite/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { MapPin, Calendar } from 'lucide-react';

interface PhotoGridProps {
  moments: Moment[];
  onDetail: (moment: Moment) => void;
  onEdit?: (moment: Moment) => void;
}

export function PhotoGrid({ moments, onDetail, onEdit }: PhotoGridProps) {
  return (
    <div className="photo-grid">
      {moments.map((moment) => (
        <div
          key={moment.id}
          className="photo-card relative"
          onClick={() => onDetail(moment)}
        >
          <Image
            src={moment.photoUrl}
            alt={moment.caption || 'Moment'}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover"
            unoptimized
            priority={false}
          />

          <div className="photo-overlay">
            {moment.caption && (
              <p className="text-sm font-medium mb-2 line-clamp-2">
                {moment.caption}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(moment.date), 'MMM d, yyyy')}
              </div>

              {moment.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{moment.location}</span>
                </div>
              )}
            </div>

            {moment.tags && moment.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {moment.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-foreground/20 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {moment.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-foreground/20 rounded text-xs">
                    +{moment.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(moment);
                }}
                className="mt-3 px-3 py-1.5 bg-foreground/15 hover:bg-foreground/25 rounded text-xs font-medium transition-colors"
              >
                Edit Moment
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
