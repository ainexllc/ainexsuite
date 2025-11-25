'use client';

import { useMemo } from 'react';
import { getMonth, getDate } from 'date-fns';
import { Sparkles, CalendarClock } from 'lucide-react';
import { useMomentsStore } from '@/lib/store';
import Image from 'next/image';
import type { Moment } from '@ainexsuite/types';

interface FlashbackWidgetProps {
  onDetail: (moment: Moment) => void;
}

export function FlashbackWidget({ onDetail }: FlashbackWidgetProps) {
  const { moments } = useMomentsStore();

  const flashbacks = useMemo(() => {
    const today = new Date();
    const currentMonth = getMonth(today);
    const currentDay = getDate(today);

    return moments.filter((moment) => {
      const mDate = new Date(moment.date);
      // Match Month and Day, but NOT the same year (must be in the past)
      return (
        getMonth(mDate) === currentMonth &&
        getDate(mDate) === currentDay &&
        mDate.getFullYear() < today.getFullYear()
      );
    }).sort((a, b) => b.date - a.date); // Newest first
  }, [moments]);

  if (flashbacks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-amber-500/20 p-2 rounded-lg">
          <CalendarClock className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">On This Day</h3>
          <p className="text-xs text-text-muted">Relive memories from years past</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashbacks.slice(0, 3).map((moment) => {
          const yearsAgo = new Date().getFullYear() - new Date(moment.date).getFullYear();
          return (
            <div 
              key={moment.id}
              onClick={() => onDetail(moment)}
              className="group relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer border border-outline-subtle hover:border-amber-500/50 transition-all shadow-sm hover:shadow-lg"
            >
              <Image
                src={moment.photoUrl}
                alt={moment.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-black text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    {yearsAgo} {yearsAgo === 1 ? 'Year' : 'Years'} Ago
                  </span>
                  <span className="text-xs text-white/80 font-medium">
                    {new Date(moment.date).getFullYear()}
                  </span>
                </div>
                <h4 className="text-white font-medium truncate">{moment.title || moment.caption}</h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
