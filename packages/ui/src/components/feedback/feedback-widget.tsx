'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { Button } from '../buttons/button';

interface FeedbackWidgetProps {
  userId?: string;
  userEmail?: string;
  userName?: string;
  appName: string;
}

export function FeedbackWidget({ userId, userEmail, userName, appName }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const pathname = usePathname();
  const formRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (isOpen) setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: userId || null,
        authorName: userName || null,
        authorEmail: userEmail || null,
        message: message.trim(),
        appId: appName.toLowerCase(),
        path: pathname,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 2000);
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
      {isOpen && (
        <div 
          ref={formRef}
          className="w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-5 fade-in duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              Send Feedback
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <Send className="h-6 w-6" />
              </div>
              <p className="text-white font-medium">Thank you!</p>
              <p className="text-sm text-zinc-400 mt-1">Your feedback helps us improve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind? Found a bug or have a feature idea?"
                  className="w-full h-32 bg-zinc-800 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <AlertCircle className="h-3 w-3" />
                  Failed to send. Please try again.
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!message.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send Feedback
                      <Send className="h-3 w-3 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-[10px] text-zinc-600 text-center">
                Submitting as {userEmail || 'Anonymous'}
              </div>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110",
          isOpen 
            ? "bg-indigo-500 text-white rotate-90" 
            : "bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 hover:border-indigo-500/50"
        )}
        title="Send Feedback"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
