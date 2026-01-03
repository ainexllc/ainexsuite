'use client';

import { useState } from 'react';
import { Bell, BellDot, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { useSpaceNotifications } from '../../hooks/use-space-notifications';
import { formatDistanceToNow } from 'date-fns';
import type { NotificationItem } from '@ainexsuite/types';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    handleAcceptInvitation,
    handleDeclineInvitation,
  } = useSpaceNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (notif: NotificationItem) => {
    const invitationId = notif.metadata?.invitationId as string | undefined;
    if (!invitationId) return;

    setProcessingId(notif.id);
    try {
      await handleAcceptInvitation(invitationId, notif.id);
      // Optionally reload to show new space
      window.location.reload();
    } catch (error) {
      console.error('Failed to accept:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (notif: NotificationItem) => {
    const invitationId = notif.metadata?.invitationId as string | undefined;
    if (!invitationId) return;

    setProcessingId(notif.id);
    try {
      await handleDeclineInvitation(invitationId, notif.id);
    } catch (error) {
      console.error('Failed to decline:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'space_invite':
        return <UserPlus className="h-5 w-5 text-indigo-400" />;
      case 'nudge':
        return <span className="text-xl">👋</span>;
      case 'wager_won':
        return <span className="text-xl">🏆</span>;
      case 'wager_lost':
        return <span className="text-xl">💸</span>;
      case 'quest_update':
        return <span className="text-xl">👑</span>;
      case 'system':
        return <span className="text-xl">🤖</span>;
      default:
        return <Bell className="h-5 w-5 text-white/50" />;
    }
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
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
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
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 transition-colors hover:bg-white/5 ${notif.read ? 'opacity-60' : 'bg-indigo-500/5'}`}
                      onClick={() => !notif.read && notif.type !== 'space_invite' && markAsRead(notif.id)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm ${notif.read ? 'font-medium text-white/80' : 'font-bold text-white'}`}>
                            {notif.title}
                          </h4>
                          <p className="text-xs text-white/60 leading-snug mb-1">{notif.message}</p>
                          <span className="text-[10px] text-white/30">
                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                          </span>

                          {/* Accept/Decline buttons for space invites */}
                          {notif.type === 'space_invite' && !notif.read && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAccept(notif);
                                }}
                                disabled={processingId === notif.id}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                              >
                                {processingId === notif.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Accept
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDecline(notif);
                                }}
                                disabled={processingId === notif.id}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white/70 text-xs font-medium rounded-lg transition-colors"
                              >
                                <X className="h-3 w-3" />
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                        {!notif.read && notif.type !== 'space_invite' && (
                          <div className="self-center flex-shrink-0">
                            <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                          </div>
                        )}
                      </div>
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
