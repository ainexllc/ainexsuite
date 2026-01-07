'use client';

import { useState } from 'react';
import {
  Sparkles,
  BarChart3,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

interface AIToolbarProps {
  onGenerate: () => void;
  onAnalyze: () => void;
  onSuggest: () => void;
  onChat: () => void;
  isGenerating: boolean;
  isAnalyzing: boolean;
  isSuggesting: boolean;
  hasSelection: boolean;
  nodeCount: number;
}

export function AIToolbar({
  onGenerate,
  onAnalyze,
  onSuggest,
  onChat,
  isGenerating,
  isAnalyzing,
  isSuggesting,
  hasSelection,
  nodeCount,
}: AIToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const buttons = [
    {
      id: 'generate',
      icon: Sparkles,
      label: 'Generate',
      description: 'Create workflow from description',
      onClick: onGenerate,
      isLoading: isGenerating,
      disabled: false,
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      id: 'analyze',
      icon: BarChart3,
      label: 'Analyze',
      description: 'Get optimization insights',
      onClick: onAnalyze,
      isLoading: isAnalyzing,
      disabled: nodeCount === 0,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'suggest',
      icon: Lightbulb,
      label: 'Suggest',
      description: 'Get next step ideas',
      onClick: onSuggest,
      isLoading: isSuggesting,
      disabled: !hasSelection,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'Chat',
      description: 'Ask AI about workflow',
      onClick: onChat,
      isLoading: false,
      disabled: false,
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="absolute right-3 top-3 z-20">
      <div className="overflow-hidden rounded-lg border border-border bg-background/95 shadow-md backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-900/95">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between gap-6 px-2.5 py-1.5 transition-colors hover:bg-muted/50 dark:hover:bg-zinc-800/50"
        >
          <div className="flex items-center gap-1.5">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[11px] font-medium text-foreground">AI Tools</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </button>

        {/* Buttons */}
        {isExpanded && (
          <div className="border-t border-border p-1 dark:border-zinc-700/50">
            <div className="grid grid-cols-2 gap-0.5">
              {buttons.map((button) => {
                const Icon = button.icon;
                const isDisabled = button.disabled || button.isLoading;

                return (
                  <button
                    key={button.id}
                    onClick={button.onClick}
                    disabled={isDisabled}
                    title={button.description}
                    className={`group flex flex-col items-center gap-0.5 rounded-md p-1.5 transition-all ${
                      isDisabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-muted dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${
                        isDisabled
                          ? 'bg-muted dark:bg-zinc-800'
                          : `bg-muted dark:bg-zinc-800 group-hover:bg-gradient-to-br group-hover:${button.gradient}`
                      }`}
                    >
                      {button.isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      ) : (
                        <Icon
                          className={`h-3 w-3 transition-colors ${
                            isDisabled
                              ? 'text-muted-foreground/50'
                              : 'text-muted-foreground group-hover:text-white'
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-medium ${
                        isDisabled ? 'text-muted-foreground/50' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      {button.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick tip */}
            {!hasSelection && nodeCount > 0 && (
              <div className="mt-1 rounded bg-muted/50 px-1.5 py-1 text-center dark:bg-zinc-800/50">
                <p className="text-[9px] text-muted-foreground">
                  Select node for suggestions
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
