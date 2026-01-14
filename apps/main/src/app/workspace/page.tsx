'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatContainer } from '@/components/chat';

export default function WorkspacePage() {
  const [isLeftExpanded, setIsLeftExpanded] = useState(true);

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex overflow-hidden">
      {/* Left Panel - Chat History */}
      <aside
        className={cn(
          'flex-shrink-0 border-r border-border bg-surface-base transition-all duration-300 flex flex-col',
          isLeftExpanded ? 'w-72' : 'w-16'
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {isLeftExpanded && (
            <div className="flex items-center gap-2 text-ink-600">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Chat History</span>
            </div>
          )}
          <button
            onClick={() => setIsLeftExpanded(!isLeftExpanded)}
            className={cn(
              'p-1.5 rounded-md hover:bg-surface-muted transition-colors text-ink-500 hover:text-ink-700',
              !isLeftExpanded && 'mx-auto'
            )}
          >
            {isLeftExpanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Content placeholder */}
        <div className="flex-1 p-4">
          {isLeftExpanded && (
            <p className="text-xs text-ink-400">No conversations yet</p>
          )}
        </div>
      </aside>

      {/* Middle - AI Chatbot */}
      <main className="flex-1 flex flex-col bg-surface-base min-w-0">
        <ChatContainer />
      </main>

      {/* Right Panel - AINex Insights */}
      <aside className="w-80 flex-shrink-0 border-l border-border bg-surface-base flex flex-col">
        {/* Header */}
        <div className="h-14 flex items-center px-4 border-b border-border">
          <div className="flex items-center gap-2 text-ink-600">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AINex Insights</span>
          </div>
        </div>

        {/* Content placeholder */}
        <div className="flex-1 p-4">
          <p className="text-xs text-ink-400">No insights available</p>
        </div>
      </aside>
    </div>
  );
}
