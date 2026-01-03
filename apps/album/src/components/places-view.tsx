'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import type { Moment } from '@ainexsuite/types';
import { Play, MapPin } from 'lucide-react';

interface PlacesViewProps {
  moments: Moment[];
  onSelectLocation: (location: string) => void;
  onPlayStory: (location: string) => void;
}

interface PlaceGroup {
  location: string;
  count: number;
  latestMoment: Moment;
}

export function PlacesView({ moments, onSelectLocation, onPlayStory }: PlacesViewProps) {
  const places = useMemo(() => {
    const groups: Record<string, PlaceGroup> = {};

    moments.forEach((moment) => {
      const location = moment.location?.trim();
      if (!location) return;

      if (!groups[location]) {
        groups[location] = {
          location,
          count: 0,
          latestMoment: moment,
        };
      }

      groups[location].count++;
      if (moment.date > groups[location].latestMoment.date) {
        groups[location].latestMoment = moment;
      }
    });

    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [moments]);

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-surface-elevated p-4 rounded-full mb-4">
          <MapPin className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-medium text-text-primary">No places found</h3>
        <p className="text-text-muted max-w-sm mt-2">
          Add locations to your moments to see them grouped here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {places.map((place) => (
        <div
          key={place.location}
          className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-elevated hover:ring-2 hover:ring-primary transition-all text-left cursor-pointer"
          onClick={() => onSelectLocation(place.location)}
        >
          {/* Background Image */}
          {place.latestMoment.photoUrl ? (
            <Image
              src={place.latestMoment.photoUrl}
              alt={place.location}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-surface-elevated flex items-center justify-center">
              <MapPin className="h-10 w-10 text-surface-hover" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
            <h3 className="text-white font-semibold text-lg line-clamp-1">
              {place.location}
            </h3>
            <p className="text-white/80 text-sm">
              {place.count} {place.count === 1 ? 'moment' : 'moments'}
            </p>
          </div>

          {/* Play Button - Only visible on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayStory(place.location);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
            title="Play Story"
          >
            <Play className="h-5 w-5 fill-current" />
          </button>
        </div>
      ))}
    </div>
  );
}
