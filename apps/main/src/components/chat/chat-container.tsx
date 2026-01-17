'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@ainexsuite/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  sendMessage,
  generateMessageId,
  type ChatMessage,
} from '@/lib/ai/chat-service';
import { cn } from '@/lib/utils';
import { MarkdownMessage } from './markdown-message';
import { ToolCallCard } from './tool-call-card';
import { useBotAvatar } from '@/hooks/use-bot-avatar';

interface MessageBubbleProps {
  message: ChatMessage;
  userPhotoURL?: string | null;
  botAvatarURL?: string | null;
}

// Animated bot avatar component with optional continuous looping
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
        }, loop ? 100 : 500);
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

  // Fallback to sparkles icon with gradient background
  const iconSize = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5';
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-amber-500/20">
      <Sparkles className={cn(iconSize, 'text-orange-500')} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-orange-500"
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message, userPhotoURL, botAvatarURL }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden',
          isUser
            ? userPhotoURL
              ? 'bg-zinc-100 dark:bg-zinc-800'
              : 'bg-orange-500 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
        )}
      >
        {isUser ? (
          userPhotoURL ? (
            <Image
              src={userPhotoURL}
              alt="You"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <User className="w-4 h-4" />
          )
        ) : (
          <BotAvatarDisplay videoURL={botAvatarURL} />
        )}
      </div>

      {/* Message content */}
      <div className={cn('max-w-[85%] flex flex-col', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-orange-500 text-white rounded-tr-md'
              : 'bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-tl-md'
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownMessage content={message.content} className="text-sm" />
          )}
        </div>

        {/* Tool calls - shown directly below message, always visible */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full mt-3 space-y-2">
            {message.toolCalls.map((tc, idx) => (
              <ToolCallCard key={idx} toolCall={tc} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Suggestion chips for empty state
const suggestions = ['Show my notes', 'Create a note', 'My favorites'];

// Input form component - defined outside to prevent re-creation on each render
interface InputFormProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  centered?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

function InputForm({ input, setInput, onSubmit, isLoading, centered = false, inputRef }: InputFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('flex gap-3', centered && 'w-full max-w-2xl')}
    >
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Lumi anything about your notes..."
        className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="px-4 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
        <span className="hidden sm:inline">Send</span>
      </button>
    </form>
  );
}

export function ChatContainer() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the bot avatar (animated video if available)
  const { botAvatarURL } = useBotAvatar({
    userId: user?.uid,
    tier: (user as { subscriptionTier?: 'free' | 'trial' | 'pro' | 'premium' })?.subscriptionTier,
  });

  const hasMessages = messages.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when switching from centered to bottom layout
  useEffect(() => {
    if (hasMessages && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.uid || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { response, toolCalls } = await sendMessage(
        user.uid,
        userMessage.content,
        messages
      );

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        toolCalls,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-zinc-900">
      {!hasMessages ? (
        // ========== EMPTY STATE: Centered layout (Gemini-style) ==========
        <div className="flex-1 flex flex-col items-center justify-center p-5">
          {/* Welcome content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            {/* Animated avatar with glow */}
            <div className="relative mb-4 mx-auto w-20 h-20">
              <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-orange-500 to-amber-500 blur-xl opacity-25 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-orange-500/50 bg-zinc-100 dark:bg-zinc-800">
                <BotAvatarDisplay videoURL={botAvatarURL} loop size="lg" />
              </div>
            </div>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Lumi
            </p>
            <p className="text-sm mt-2 max-w-[320px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Hey there! 👋 How can I help with your notes today?
            </p>

            {/* Suggestion chips */}
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 border border-zinc-200 dark:border-zinc-700 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Centered input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-2xl px-4"
          >
            <InputForm
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              centered
            />
          </motion.div>
        </div>
      ) : (
        // ========== WITH MESSAGES: Top messages, bottom input ==========
        <>
          {/* Messages area - scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  userPhotoURL={user?.photoURL}
                  botAvatarURL={botAvatarURL}
                />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                  <BotAvatarDisplay videoURL={botAvatarURL} />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-md px-4 py-3">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area - fixed at bottom */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
            <div className="max-w-4xl mx-auto">
              <InputForm
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                inputRef={inputRef}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
