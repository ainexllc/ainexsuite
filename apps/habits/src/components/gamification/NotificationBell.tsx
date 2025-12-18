'use client';

import { useState } from 'react';
import { Bell, BellDot } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { Notification } from '../../types/models';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { notifications, markNotificationRead } = useGrowStore();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/10 text-white/70 transition-colors relative"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <div className="relative">
            <BellDot className="h-5 w-5 text-indigo-400 animate-pulse" />
            {/* Fallback badge just in case */}
            {/* <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" /> */}
          </div>
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-96">
            <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs text-indigo-400">{unreadCount} new</span>}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-xs">
                  No notifications yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif: Notification) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 flex gap-3 transition-colors hover:bg-white/5 ${notif.isRead ? 'opacity-60' : 'bg-indigo-500/5'}`}
                      onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                    >
                      <div className="mt-1">
                        {notif.type === 'nudge' && <span className="text-xl">👋</span>}
                        {notif.type === 'wager_won' && <span className="text-xl">🏆</span>}
                        {notif.type === 'wager_lost' && <span className="text-xl">💸</span>}
                        {notif.type === 'quest_update' && <span className="text-xl">👑</span>}
                        {notif.type === 'system' && <span className="text-xl">🤖</span>}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm ${notif.isRead ? 'font-medium text-white/80' : 'font-bold text-white'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-white/60 leading-snug mb-1">{notif.message}</p>
                        <span className="text-[10px] text-white/30">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <div className="self-center">
                          <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
