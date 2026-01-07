'use client';

import { Sparkles, X, Send, FileText, Wand2, Scissors, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function SuggestionButton({
  children,
  icon: Icon,
  onClick
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
        'text-sm text-foreground/80 hover:text-foreground',
        'bg-muted/50 hover:bg-muted transition-colors'
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span>{children}</span>
    </button>
  );
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'w-80 border-l border-border bg-background flex flex-col',
        'transition-all duration-300 ease-out',
        'animate-in slide-in-from-right'
      )}
    >
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Actions */}
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Type @ to reference sources
        </p>

        <div className="space-y-2">
          <SuggestionButton icon={FileText}>
            Summarize this document
          </SuggestionButton>
          <SuggestionButton icon={Wand2}>
            Fix grammar & spelling
          </SuggestionButton>
          <SuggestionButton icon={Scissors}>
            Make it more concise
          </SuggestionButton>
          <SuggestionButton icon={RefreshCw}>
            Rephrase selection
          </SuggestionButton>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            AI features coming soon. This sidebar will help you write, edit, and improve your documents.
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="flex-none p-4 border-t border-border">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <input
            placeholder="Ask AI..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled
          />
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Coming soon
        </p>
      </div>
    </div>
  );
}
