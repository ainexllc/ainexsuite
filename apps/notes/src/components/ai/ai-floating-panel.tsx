'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import {
  GripVertical,
  Sparkles,
  X,
  MoreVertical,
  Send,
  StickyNote,
  Search,
  FileText,
  FolderOpen,
  Loader2,
  Trash2,
} from 'lucide-react';
import { cn } from '@ainexsuite/ui';
import { usePanelDragResize, type PanelState } from './use-panel-drag-resize';
import { useNotesAI } from './use-notes-ai';
import { SUGGESTED_PROMPTS, type SuggestedPrompt } from './notes-ai-prompts';
import { ChatMarkdown } from './chat-markdown';
import type { Note, Label } from '@/lib/types/note';

export interface AIFloatingPanelUser {
  displayName?: string | null;
  photoURL?: string | null;
  subscriptionTier?: 'free' | 'pro' | 'ultra' | string;
}

export interface AIFloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  labels: Label[];
  appName?: string;
  appColor?: string;
  user?: AIFloatingPanelUser | null;
}

const DEFAULT_STATE: PanelState = {
  x: typeof window !== 'undefined' ? window.innerWidth - 400 : 800,
  y: 80,
  width: 380,
  height: 550,
};

/**
 * AIFloatingPanel - Floating AI assistant panel
 *
 * Features:
 * - Draggable via header
 * - Resizable via corner/edges
 * - Position persistence in localStorage
 * - Chat interface with AI
 * - App context indicator
 * - Only closes via X button (not click-outside)
 */
export function AIFloatingPanel({
  isOpen,
  onClose,
  notes,
  labels,
  appName = 'Notes',
  appColor = '#eab308',
  user,
}: AIFloatingPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize drag/resize hook
  const {
    state,
    dragHandleProps,
    getResizeHandleProps,
    updateState,
  } = usePanelDragResize({
    initialState: DEFAULT_STATE,
    minWidth: 320,
    minHeight: 400,
    maxWidth: 600,
    maxHeight: typeof window !== 'undefined' ? window.innerHeight * 0.9 : 800,
    storageKey: 'notes-ai-panel-state',
  });

  // Initialize AI hook
  const {
    messages,
    loading,
    streaming,
    sendMessage,
    clearMessages,
  } = useNotesAI({
    notes,
    labels,
  });

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bounds check - reset position if panel is off-screen
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const maxX = window.innerWidth - 100; // At least 100px visible
      const maxY = window.innerHeight - 100;

      if (state.x > maxX || state.y > maxY || state.x < 0 || state.y < 0) {
        // Panel was off-screen (likely from localStorage with different monitor), reset position
        updateState({
          x: Math.max(20, window.innerWidth - 400),
          y: 80,
          width: 380,
          height: Math.min(550, window.innerHeight - 100),
        });
      }
    }
  }, [mounted, state.x, state.y, updateState]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Responsive: full screen on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        updateState({
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [updateState]);

  // Handle send message
  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading || streaming) return;

    setInputValue('');
    await sendMessage(trimmed);
  }, [inputValue, loading, streaming, sendMessage]);

  // Handle suggested prompt click
  const handlePromptClick = useCallback((prompt: SuggestedPrompt) => {
    if (prompt.hasPlaceholder) {
      setInputValue(prompt.prompt);
      inputRef.current?.focus();
    } else {
      sendMessage(prompt.prompt);
    }
  }, [sendMessage]);

  // Handle Enter key in textarea
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Get icon for suggested prompt
  const getPromptIcon = (iconName: string) => {
    const icons: Record<string, typeof Search> = {
      Search,
      FileText,
      FolderOpen,
      Sparkles,
    };
    const Icon = icons[iconName] || Sparkles;
    return <Icon className="h-3.5 w-3.5" />;
  };

  if (!mounted) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'fixed z-[100] flex flex-col',
            'rounded-2xl border shadow-2xl',
            'bg-zinc-900/95 backdrop-blur-xl',
            'border-zinc-700',
            isMobile && 'rounded-none'
          )}
          style={{
            left: state.x,
            top: state.y,
            width: state.width,
            height: state.height,
          }}
        >
          {/* Header with drag handle */}
          <div
            {...(isMobile ? {} : dragHandleProps)}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5',
              'border-b border-zinc-700',
              !isMobile && 'cursor-grab active:cursor-grabbing',
              'select-none'
            )}
          >
            {!isMobile && (
              <GripVertical className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            )}
            <Sparkles
              className="h-4 w-4 flex-shrink-0"
              style={{ color: appColor }}
            />
            <span className="font-semibold text-white flex-1 text-sm">
              AINex
            </span>

            {/* Membership Badge - show for all tiers */}
            {user?.subscriptionTier && (
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded',
                  user.subscriptionTier === 'premium'
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
                    : user.subscriptionTier === 'pro'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : user.subscriptionTier === 'trial'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-zinc-600 text-zinc-200'
                )}
              >
                {user.subscriptionTier.toUpperCase()}
              </span>
            )}

            {/* User Avatar */}
            {user?.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-zinc-600"
                unoptimized
              />
            )}

            {/* Menu button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <MoreVertical className="h-4 w-4 text-zinc-400" />
              </button>

              {/* Menu dropdown */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl z-10">
                  <button
                    onClick={() => {
                      clearMessages();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                    New chat
                  </button>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-zinc-400" />
            </button>
          </div>

          {/* App Context Badge */}
          <div className="px-3 py-1.5 bg-zinc-800/50 border-b border-zinc-700">
            <div className="flex items-center gap-1.5 text-xs">
              <StickyNote className="h-3.5 w-3.5" style={{ color: appColor }} />
              <span className="text-zinc-300">{appName}</span>
              <span className="text-zinc-500">
                • {notes.length} notes • {labels.length} labels
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ? (
              // Welcome state
              <>
                <p className="text-zinc-400 text-xs">
                  How can I help with your notes today?
                </p>

                <div className="space-y-1.5 mt-3">
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1.5">
                    💡 Suggestions
                  </p>
                  {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handlePromptClick(prompt)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg',
                        'border border-zinc-700/80 bg-zinc-800/40',
                        'text-xs text-zinc-300 text-left',
                        'hover:bg-zinc-800 hover:border-zinc-600',
                        'transition-all duration-150'
                      )}
                    >
                      <span className="text-zinc-500">
                        {getPromptIcon(prompt.icon.name || 'Sparkles')}
                      </span>
                      <span className="truncate">{prompt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              // Message list
              messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'max-w-[85%] rounded-xl px-3 py-2',
                    message.role === 'user'
                      ? 'ml-auto rounded-br-sm text-black'
                      : 'mr-auto rounded-bl-sm bg-zinc-800 text-white'
                  )}
                  style={
                    message.role === 'user'
                      ? { backgroundColor: appColor }
                      : undefined
                  }
                >
                  {message.role === 'user' ? (
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <ChatMarkdown content={message.content} />
                  )}
                </motion.div>
              ))
            )}

            {/* Loading indicator */}
            {(loading || streaming) && (
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-2.5 border-t border-zinc-700">
            <div className="flex items-end gap-1.5">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className={cn(
                  'flex-1 resize-none rounded-lg px-3 py-2',
                  'bg-zinc-800 border border-zinc-700',
                  'text-xs text-white placeholder:text-zinc-500',
                  'focus:outline-none focus:border-zinc-600',
                  'max-h-28'
                )}
                style={{ minHeight: '36px' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || loading || streaming}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  inputValue.trim()
                    ? 'bg-white text-zinc-900 hover:bg-zinc-200'
                    : 'bg-zinc-800 text-zinc-500'
                )}
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Resize handles (desktop only) */}
          {!isMobile && (
            <>
              {/* Right edge */}
              <div
                {...getResizeHandleProps('right')}
                className="absolute right-0 top-4 bottom-4 w-2 cursor-ew-resize"
              />
              {/* Bottom edge */}
              <div
                {...getResizeHandleProps('bottom')}
                className="absolute left-4 right-4 bottom-0 h-2 cursor-ns-resize"
              />
              {/* Corner */}
              <div
                {...getResizeHandleProps('corner')}
                className={cn(
                  'absolute right-0 bottom-0 w-4 h-4',
                  'cursor-nwse-resize',
                  'bg-zinc-600/50 rounded-tl-md',
                  'hover:bg-zinc-500/50 transition-colors'
                )}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render via portal to avoid z-index issues
  return createPortal(panelContent, document.body);
}
