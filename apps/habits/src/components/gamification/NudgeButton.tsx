'use client';

import { useState } from 'react';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';
import { Notification } from '../../types/models';

interface NudgeButtonProps {
  targetName: string;
  targetId: string;
  habitTitle: string;
}

export function NudgeButton({ targetName, targetId, habitTitle }: NudgeButtonProps) {
  const [nudged, setNudged] = useState(false);
  const { sendNotification, getCurrentSpace } = useGrowStore();
  const { user } = useAuth();
  const currentSpace = getCurrentSpace();

  const handleNudge = async () => {
    if (!user || !currentSpace) return;
    
    setNudged(true);
    
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      recipientId: targetId,
      senderId: user.uid,
      spaceId: currentSpace.id,
      type: 'nudge',
      title: `${user.displayName || 'Partner'} nudged you!`,
      message: `Time to complete "${habitTitle}"! You got this!`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await sendNotification(notification);
    
    setTimeout(() => setNudged(false), 5000); // Reset after delay
  };

  return (
    <button
      onClick={handleNudge}
      disabled={nudged}
      className={`
        group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all
        ${nudged 
          ? 'bg-green-500/20 text-green-400 cursor-default' 
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white hover:scale-105'
        }
      `}
      title={`Send a nudge to ${targetName}`}
    >
      {nudged ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Sent!
        </>
      ) : (
        <>
          <BellRing className="h-3 w-3 group-hover:animate-swing" />
          Nudge
        </>
      )}
    </button>
  );
}