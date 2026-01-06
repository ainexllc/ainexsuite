'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, AlertCircle, Lightbulb, Bug } from 'lucide-react';
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

type FeedbackType = 'bug' | 'feature';

export function FeedbackWidget({ userId, userEmail, userName, appName }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
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

    // Check if user is authenticated (Firestore rules require auth)
    if (!userId) {
      // eslint-disable-next-line no-console
      console.error('[FeedbackWidget] Cannot submit feedback: user not authenticated');
      setErrorMessage('Please sign in to send feedback.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: userId || null,
        authorName: userName || null,
        authorEmail: userEmail || null,
        message: message.trim(),
        type: feedbackType,
        appId: appName.toLowerCase(),
        path: pathname,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setMessage('');
      setFeedbackType('bug');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 2000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[FeedbackWidget] Failed to submit feedback:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('permission') || errorMsg.includes('PERMISSION_DENIED')) {
        setErrorMessage('Permission denied. Please try signing out and back in.');
      } else if (errorMsg.includes('network') || errorMsg.includes('offline')) {
        setErrorMessage('Network error. Please check your connection.');
      } else {
        setErrorMessage('Failed to send. Please try again.');
      }
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
          className="w-80 bg-popover border border-border rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-5 fade-in duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              Send Feedback
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <Send className="h-6 w-6" />
              </div>
              <p className="text-foreground font-medium">Thank you!</p>
              <p className="text-sm text-muted-foreground mt-1">Your feedback helps us improve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    feedbackType === 'bug'
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-muted text-muted-foreground border border-border hover:border-red-500/30 hover:text-red-400"
                  )}
                >
                  <Bug className="h-4 w-4" />
                  Bug
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('feature')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    feedbackType === 'feature'
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-muted text-muted-foreground border border-border hover:border-amber-500/30 hover:text-amber-400"
                  )}
                >
                  <Lightbulb className="h-4 w-4" />
                  Feature
                </button>
              </div>

              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={feedbackType === 'bug' ? "Describe the bug you encountered..." : "Describe your feature idea..."}
                  className="w-full h-32 bg-muted border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring resize-none transition-all"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {errorMessage || 'Failed to send. Please try again.'}
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
              
              <div className="text-[10px] text-muted-foreground text-center">
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
            ? "bg-indigo-500 text-foreground rotate-90"
            : "bg-muted text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
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
