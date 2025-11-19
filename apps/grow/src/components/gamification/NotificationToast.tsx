'use client';

import { useEffect, useState } from 'react';
import { useGrowStore } from '../../lib/store';
import { Notification } from '../../types/models';
import { X } from 'lucide-react';

export function NotificationToast() {
  const { notifications, markNotificationRead } = useGrowStore();
  const [visibleToast, setVisibleToast] = useState<Notification | null>(null);

  // Watch for new unread notifications
  useEffect(() => {
    const latest = notifications[0]; // Store sorts by date desc generally, or we ensure query does
    if (latest && !latest.isRead) {
      // Only show if it's very recent (e.g. created in last 10 seconds) to avoid spam on load
      const now = new Date().getTime();
      const notifTime = new Date(latest.createdAt).getTime();
      if (now - notifTime < 10000) {
        setVisibleToast(latest);
        
        // Auto hide after 5s
        const timer = setTimeout(() => {
          setVisibleToast(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  if (!visibleToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-up">
      <div className="bg-[#1a1a1a] border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 rounded-xl p-4 max-w-sm flex gap-3 items-start">
        <div className="mt-0.5">
          {visibleToast.type === 'nudge' && <span className="text-xl">👋</span>}
          {visibleToast.type === 'wager_won' && <span className="text-xl">🏆</span>}
          {visibleToast.type === 'wager_lost' && <span className="text-xl">💸</span>}
          {visibleToast.type === 'quest_update' && <span className="text-xl">👑</span>}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-0.5">{visibleToast.title}</h4>
          <p className="text-xs text-white/70">{visibleToast.message}</p>
        </div>
        <button 
          onClick={() => {
            markNotificationRead(visibleToast.id);
            setVisibleToast(null);
          }}
          className="text-white/30 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
