"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  GripVertical,
  Sparkles,
  X,
  MoreVertical,
  Send,
  Loader2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { usePanelDragResize, type PanelState } from "./use-panel-drag-resize";
import { ChatMarkdown } from "./chat-markdown";
import type { SubscriptionTier } from "@ainexsuite/types";

/**
 * Message type for AI conversations
 */
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Suggested prompt configuration
 */
export interface SuggestedPrompt {
  id: string;
  label: string;
  prompt: string;
  icon: LucideIcon;
  /** If true, prompt is placed in input for editing */
  hasPlaceholder?: boolean;
}

/**
 * User information for the panel
 */
export interface AIFloatingPanelUser {
  uid?: string;
  displayName?: string | null;
  photoURL?: string | null;
  subscriptionTier?: SubscriptionTier;
}

/**
 * Context stats to display in the panel header
 */
export interface AIContextStats {
  label: string;
  count: number;
}

/**
 * Bot avatar display component props
 */
export interface BotAvatarDisplayProps {
  /** URL of the animated avatar video */
  videoURL?: string | null;
  /** If true, plays continuously. If false, plays 2x then stops. */
  loop?: boolean;
  /** Size variant */
  size?: "sm" | "lg";
  /** Fallback icon color class */
  iconColorClass?: string;
}

/**
 * BotAvatarDisplay - Animated bot avatar display component
 * Shows video if available, falls back to static icon
 */
export function BotAvatarDisplay({
  videoURL,
  loop = false,
  size = "sm",
  iconColorClass = "text-amber-500",
}: BotAvatarDisplayProps) {
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
        setTimeout(
          () => {
            video.currentTime = 0;
            video.play().catch(() => {});
          },
          loop ? 100 : 500
        );
      }
    };

    video.addEventListener("ended", handleEnded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("ended", handleEnded);
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

  // Fallback to sparkles icon
  const iconSize = size === "lg" ? "w-10 h-10" : "w-4 h-4";
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20">
      <Sparkles className={cn(iconSize, iconColorClass)} />
    </div>
  );
}

export interface AIFloatingPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Messages in the conversation */
  messages: AIMessage[];
  /** Whether AI is currently loading/thinking */
  loading?: boolean;
  /** Whether AI is streaming a response */
  streaming?: boolean;
  /** Send a message to the AI */
  onSendMessage: (message: string) => Promise<void>;
  /** Clear all messages */
  onClearMessages: () => void;
  /** Assistant name (default: "Lumi") */
  assistantName?: string;
  /** App name for context badge */
  appName?: string;
  /** App color (hex) for theming */
  appColor?: string;
  /** App icon component */
  AppIcon?: LucideIcon;
  /** Context stats to display (e.g., "12 notes • 5 labels") */
  contextStats?: AIContextStats[];
  /** Model name to display */
  modelName?: string;
  /** Current user */
  user?: AIFloatingPanelUser | null;
  /** Bot avatar URL (animated video) */
  botAvatarURL?: string | null;
  /** Suggested prompts to show in empty state */
  suggestedPrompts?: SuggestedPrompt[];
  /** Welcome greeting text */
  welcomeGreeting?: string;
  /** Welcome subtext */
  welcomeSubtext?: string;
  /** Input placeholder text */
  inputPlaceholder?: string;
  /** Storage key for position persistence */
  storageKey?: string;
  /** Default panel state */
  defaultState?: Partial<PanelState>;
  /** Link color class for markdown */
  linkColorClass?: string;
}

const DEFAULT_STATE: PanelState = {
  x: typeof window !== "undefined" ? window.innerWidth - 400 : 800,
  y: 80,
  width: 380,
  height:
    typeof window !== "undefined" ? Math.floor(window.innerHeight * 0.75) : 600,
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
 * - Customizable appearance and behavior
 * - Only closes via X button (not click-outside)
 *
 * @example
 * ```tsx
 * const { messages, loading, sendMessage, clearMessages } = useMyAI();
 *
 * <AIFloatingPanel
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   messages={messages}
 *   loading={loading}
 *   onSendMessage={sendMessage}
 *   onClearMessages={clearMessages}
 *   appName="Notes"
 *   appColor="#eab308"
 *   contextStats={[{ label: "notes", count: 12 }, { label: "labels", count: 5 }]}
 * />
 * ```
 */
export function AIFloatingPanel({
  isOpen,
  onClose,
  messages,
  loading = false,
  streaming = false,
  onSendMessage,
  onClearMessages,
  assistantName = "Lumi",
  appName = "App",
  appColor = "#eab308",
  AppIcon = Sparkles,
  contextStats = [],
  modelName,
  user,
  botAvatarURL,
  suggestedPrompts = [],
  welcomeGreeting = "Hey there! 👋",
  welcomeSubtext,
  inputPlaceholder = "Ask anything...",
  storageKey = "ai-panel-state",
  defaultState,
  linkColorClass,
}: AIFloatingPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const initialState = { ...DEFAULT_STATE, ...defaultState };

  // Initialize drag/resize hook
  const { state, dragHandleProps, getResizeHandleProps, updateState } =
    usePanelDragResize({
      initialState,
      minWidth: 320,
      minHeight: 300,
      maxWidth: 500,
      maxHeight:
        typeof window !== "undefined" ? window.innerHeight - 40 : 500,
      storageKey,
    });

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate right-aligned position within content container
  const getContainerRightEdge = useCallback(() => {
    if (typeof window === "undefined") return 800;
    const containerMaxWidth = 1152; // max-w-6xl
    const viewportWidth = window.innerWidth;
    const containerWidth = Math.min(viewportWidth - 32, containerMaxWidth);
    const containerLeft = (viewportWidth - containerWidth) / 2;
    const containerRight = containerLeft + containerWidth;
    return containerRight - 380 - 16;
  }, []);

  // Position panel right-aligned on open
  useEffect(() => {
    if (mounted && isOpen && typeof window !== "undefined") {
      const rightAlignedX = getContainerRightEdge();
      updateState({
        x: rightAlignedX,
        y: 80,
        width: 380,
        height: Math.floor(window.innerHeight * 0.75),
      });
    }
  }, [mounted, isOpen, updateState, getContainerRightEdge]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (isOpen && mounted && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      } else if (isOpen) {
        const rightAlignedX = getContainerRightEdge();
        updateState({
          x: rightAlignedX,
          y: 80,
          width: 380,
          height: Math.floor(window.innerHeight * 0.75),
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateState, isOpen, getContainerRightEdge]);

  // Handle send message
  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading || streaming) return;

    setInputValue("");
    await onSendMessage(trimmed);
  }, [inputValue, loading, streaming, onSendMessage]);

  // Handle suggested prompt click
  const handlePromptClick = useCallback(
    (prompt: SuggestedPrompt) => {
      if (prompt.hasPlaceholder) {
        setInputValue(prompt.prompt);
        inputRef.current?.focus();
      } else {
        onSendMessage(prompt.prompt);
      }
    },
    [onSendMessage]
  );

  // Handle Enter key in textarea
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (!mounted) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Format context stats string
  const contextStatsString = contextStats
    .map((s) => `${s.count} ${s.label}`)
    .join(" • ");

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "fixed z-[100] flex flex-col",
            "rounded-2xl border shadow-2xl",
            "bg-zinc-900/95 backdrop-blur-xl",
            "border-zinc-700",
            isMobile && "rounded-none"
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
              "flex items-center gap-2 px-3 py-2.5",
              "border-b border-zinc-700",
              !isMobile && "cursor-grab active:cursor-grabbing",
              "select-none"
            )}
          >
            {!isMobile && (
              <GripVertical className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            )}

            <span className="font-semibold text-white flex-1 text-sm">
              {assistantName}
            </span>

            {/* Membership Badge */}
            {user?.subscriptionTier && (
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded",
                  user.subscriptionTier === "premium"
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                    : user.subscriptionTier === "pro"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : user.subscriptionTier === "trial"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        : "bg-zinc-600 text-zinc-200"
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

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl z-10">
                  <button
                    onClick={() => {
                      onClearMessages();
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
                <AppIcon className="h-3.5 w-3.5" style={{ color: appColor }} />
                <span className="text-zinc-300">{appName}</span>
                {contextStatsString && (
                  <span className="text-zinc-500">• {contextStatsString}</span>
                )}
              </div>
              {modelName && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-700/50 text-[10px] text-zinc-400 font-medium">
                  {modelName}
                </span>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ? (
              // Welcome state
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative mb-3"
                >
                  <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-amber-500 to-orange-500 blur-xl opacity-25 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-amber-500/50 bg-zinc-800">
                    <BotAvatarDisplay
                      videoURL={botAvatarURL}
                      loop
                      size="lg"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h3 className="text-base font-semibold text-white mb-0.5">
                    {welcomeGreeting}
                  </h3>
                  {welcomeSubtext && (
                    <p className="text-zinc-400 text-xs max-w-[200px] mb-4">
                      {welcomeSubtext}
                    </p>
                  )}
                </motion.div>

                {suggestedPrompts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="w-full space-y-1.5"
                  >
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1.5">
                      💡 Try asking
                    </p>
                    {suggestedPrompts.slice(0, 4).map((prompt) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={prompt.id}
                          onClick={() => handlePromptClick(prompt)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg",
                            "border border-zinc-700/80 bg-zinc-800/40",
                            "text-xs text-zinc-300 text-left",
                            "hover:bg-zinc-800 hover:border-zinc-600",
                            "transition-all duration-150"
                          )}
                        >
                          <span className="text-zinc-500">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate">{prompt.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
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
                    "flex gap-2",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg flex-shrink-0 overflow-hidden bg-zinc-800 border border-zinc-700">
                      <BotAvatarDisplay videoURL={botAvatarURL} />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2",
                      message.role === "user"
                        ? "rounded-br-sm text-black"
                        : "rounded-bl-sm bg-zinc-800 text-white"
                    )}
                    style={
                      message.role === "user"
                        ? { backgroundColor: appColor }
                        : undefined
                    }
                  >
                    {message.role === "user" ? (
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    ) : (
                      <ChatMarkdown
                        content={message.content}
                        linkColorClass={linkColorClass}
                      />
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
                placeholder={inputPlaceholder}
                rows={1}
                className={cn(
                  "flex-1 resize-none rounded-lg px-3 py-2",
                  "bg-zinc-800 border border-zinc-700",
                  "text-xs text-white placeholder:text-zinc-500",
                  "focus:outline-none focus:border-zinc-600",
                  "max-h-28"
                )}
                style={{ minHeight: "36px" }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || loading || streaming}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  inputValue.trim()
                    ? "bg-white text-zinc-900 hover:bg-zinc-200"
                    : "bg-zinc-800 text-zinc-500"
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
              <div
                {...getResizeHandleProps("right")}
                className="absolute right-0 top-4 bottom-4 w-2 cursor-ew-resize"
              />
              <div
                {...getResizeHandleProps("bottom")}
                className="absolute left-4 right-4 bottom-0 h-2 cursor-ns-resize"
              />
              <div
                {...getResizeHandleProps("corner")}
                className={cn(
                  "absolute right-0 bottom-0 w-4 h-4",
                  "cursor-nwse-resize",
                  "bg-zinc-600/50 rounded-tl-md",
                  "hover:bg-zinc-500/50 transition-colors"
                )}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(panelContent, document.body);
}

export default AIFloatingPanel;
