'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import { useNotesAI, type NoteMutations } from './use-notes-ai';
import { SUGGESTED_PROMPTS, type SuggestedPrompt } from './notes-ai-prompts';
import { ChatMarkdown } from './chat-markdown';
import { useBotAvatar } from '@/hooks/use-bot-avatar';
import type { Note, Label, NoteSpace } from '@/lib/types/note';
import type { SubscriptionTier } from '@ainexsuite/types';

export interface AIFloatingPanelUser {
  uid?: string;
  displayName?: string | null;
  photoURL?: string | null;
  subscriptionTier?: SubscriptionTier;
}

/**
 * Animated bot avatar display component
 * Shows video if available, falls back to static icon
 * @param videoURL - URL of the animated avatar video
 * @param loop - If true, plays continuously. If false, plays 2x then stops.
 * @param size - Size variant: 'sm' (default), 'lg' for welcome hero
 */
function BotAvatarDisplay({
  videoURL,
  loop = false,
  size = 'sm',
}: {
  videoURL?: string | null;
  loop?: boolean;
  size?: 'sm' | 'lg';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play with optional continuous looping
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoURL) return;

    let playCount = 0;
    const maxPlays = loop ? Infinity : 2;

    const handleEnded = () => {
      playCount++;
      if (playCount < maxPlays) {
        setTimeout(() => {
          video.currentTime = 0;
          video.play().catch(() => {});
        }, loop ? 100 : 500); // Shorter pause for continuous loop
      }
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoURL, loop]);

  if (videoURL) {
    return (
      <video
        ref={videoRef}
        src={videoURL}
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  // Fallback to sparkles icon (sized based on container)
  const iconSize = size === 'lg' ? 'w-10 h-10' : 'w-4 h-4';
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20">
      <Sparkles className={cn(iconSize, 'text-amber-500')} />
    </div>
  );
}

export interface AIFloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  labels: Label[];
  /** User's available spaces for AI to reference when moving notes */
  spaces?: NoteSpace[];
  /** Currently selected space ID */
  currentSpaceId?: string;
  appName?: string;
  appColor?: string;
  user?: AIFloatingPanelUser | null;
  /** Note mutation functions for AI to execute */
  mutations?: NoteMutations;
}

const DEFAULT_STATE: PanelState = {
  x: typeof window !== 'undefined' ? window.innerWidth - 400 : 800,
  y: 80, // Just below header
  width: 380,
  height: typeof window !== 'undefined' ? Math.floor(window.innerHeight * 0.75) : 600, // 75% of viewport
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
  spaces,
  currentSpaceId,
  appName = 'Notes',
  appColor = '#eab308',
  user,
  mutations,
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
    minHeight: 300,
    maxWidth: 500,
    maxHeight: typeof window !== 'undefined' ? window.innerHeight - 40 : 500,
    storageKey: 'notes-ai-panel-state',
  });

  // Initialize AI hook with mutations for function calling
  const {
    messages,
    loading,
    streaming,
    sendMessage,
    clearMessages,
    modelName,
  } = useNotesAI({
    notes,
    labels,
    spaces,
    currentSpaceId,
    mutations,
    // Streaming disabled - function calling works better with client-side Gemini
    // TODO: Implement hybrid approach (streaming for chat-only, non-streaming for actions)
    enableStreaming: false,
  });

  // Get the bot avatar (animated video if available)
  const { botAvatarURL } = useBotAvatar({
    userId: user?.uid,
    tier: user?.subscriptionTier,
  });

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate right-aligned position within content container (max-w-6xl = 1152px)
  const getContainerRightEdge = useCallback(() => {
    if (typeof window === 'undefined') return 800;
    const containerMaxWidth = 1152; // max-w-6xl
    const viewportWidth = window.innerWidth;
    const containerWidth = Math.min(viewportWidth - 32, containerMaxWidth); // 32px = padding
    const containerLeft = (viewportWidth - containerWidth) / 2;
    const containerRight = containerLeft + containerWidth;
    return containerRight - 380 - 16; // 380 = panel width, 16 = small gap from edge
  }, []);

  // Position panel right-aligned to content container on open
  useEffect(() => {
    if (mounted && isOpen && typeof window !== 'undefined') {
      const rightAlignedX = getContainerRightEdge();
      updateState({
        x: rightAlignedX,
        y: 80, // Just below header
        width: 380,
        height: Math.floor(window.innerHeight * 0.75), // 75% of viewport
      });
    }
  }, [mounted, isOpen, updateState, getContainerRightEdge]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (isOpen && mounted && inputRef.current) {
      // Small delay to ensure animation completes and panel is visible
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

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

  // Responsive: full screen on mobile, reposition on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        updateState({
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        });
      } else if (isOpen) {
        // Reposition to stay right-aligned on resize
        const rightAlignedX = getContainerRightEdge();
        updateState({
          x: rightAlignedX,
          y: 80,
          width: 380,
          height: Math.floor(window.innerHeight * 0.75), // 75% of viewport
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateState, isOpen, getContainerRightEdge]);

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

            <span className="font-semibold text-white flex-1 text-sm">
              Lumi
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
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5" style={{ color: appColor }} />
                <span className="text-zinc-300">{appName}</span>
                <span className="text-zinc-500">
                  • {notes.length} notes • {labels.length} labels
                </span>
              </div>
              {/* Model indicator */}
              <span className="px-1.5 py-0.5 rounded bg-zinc-700/50 text-[10px] text-zinc-400 font-medium">
                {modelName}
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ? (
              // Welcome state with hero AI avatar
              <div className="flex flex-col items-center text-center">
                {/* Large animated avatar with glow effect */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative mb-3"
                >
                  {/* Glow ring - animated pulse */}
                  <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-amber-500 to-orange-500 blur-xl opacity-25 animate-pulse" />

                  {/* Avatar container */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-amber-500/50 bg-zinc-800">
                    <BotAvatarDisplay videoURL={botAvatarURL} loop size="lg" />
                  </div>
                </motion.div>

                {/* Greeting */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h3 className="text-base font-semibold text-white mb-0.5">
                    Hey there! 👋
                  </h3>
                  <p className="text-zinc-400 text-xs max-w-[200px] mb-4">
                    I&apos;m Lumi. How can I help with your notes?
                  </p>
                </motion.div>

                {/* Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="w-full space-y-1.5"
                >
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1.5">
                    💡 Try asking
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
                </motion.div>
              </div>
            ) : (
              // Message list
              messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex gap-2',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* Avatar (only for assistant messages) */}
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg flex-shrink-0 overflow-hidden bg-zinc-800 border border-zinc-700">
                      <BotAvatarDisplay videoURL={botAvatarURL} />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2',
                      message.role === 'user'
                        ? 'rounded-br-sm text-black'
                        : 'rounded-bl-sm bg-zinc-800 text-white'
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
                  </div>
                </motion.div>
              ))
            )}

            {/* Loading indicator */}
            {(loading || streaming) && (
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 overflow-hidden bg-zinc-800 border border-zinc-700">
                  <BotAvatarDisplay videoURL={botAvatarURL} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 rounded-xl rounded-bl-sm">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
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
