'use client';

import { useState } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';

// Fallback prompts when database is empty
const FALLBACK_PROMPTS = [
  { text: 'What small moment from today surprised you? Capture the details.', tags: ['reflection', 'gratitude'] },
  { text: 'Write about a conversation that changed your perspective this week.', tags: ['relationships', 'growth'] },
  { text: 'Describe a place where you feel most like yourself.', tags: ['identity', 'comfort'] },
  { text: 'What challenge are you facing? Write about one small step forward.', tags: ['goals', 'action'] },
  { text: 'Record three things you learned this week about yourself or the world.', tags: ['learning', 'growth'] },
  { text: 'What does rest mean to you right now? How can you create more of it?', tags: ['self-care', 'wellness'] },
  { text: 'Write about someone who inspired you recently.', tags: ['inspiration', 'gratitude'] },
  { text: 'If you could give yourself one piece of advice right now, what would it be?', tags: ['wisdom', 'guidance'] },
  { text: 'Describe your ideal morning routine.', tags: ['habits', 'planning'] },
  { text: 'What boundary do you need to set or maintain?', tags: ['boundaries', 'self-care'] },
];

interface SparkIdea {
  text: string;
  tags?: string[];
  source: 'fallback';
}

interface IdeaSparkCardProps {
  userId?: string;
  variant?: 'compact' | 'full';
}

export function IdeaSparkCard({ variant = 'full' }: IdeaSparkCardProps) {
  const [ideas, setIdeas] = useState<SparkIdea[]>(() => {
    const shuffled = [...FALLBACK_PROMPTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2).map(p => ({
      text: p.text,
      tags: p.tags,
      source: 'fallback' as const,
    }));
  });

  const refresh = () => {
    const shuffled = [...FALLBACK_PROMPTS].sort(() => Math.random() - 0.5);
    setIdeas(shuffled.slice(0, 2).map(p => ({
      text: p.text,
      tags: p.tags,
      source: 'fallback' as const,
    })));
  };

  const sourceLabel = 'Writing prompts to spark new ideas';

  if (variant === 'compact') {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-theme-text">Idea Sparks</h2>
              <p className="mt-1 text-xs text-theme-text-muted">
                {sourceLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-theme-text transition hover:border-[#f97316]/60 hover:text-[#f97316]"
            aria-label="Get new prompts"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {ideas.map((idea, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-zinc-800/50 p-4"
            >
              <p className="text-sm leading-relaxed text-theme-text">
                {idea.text}
              </p>
              {idea.tags && idea.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {idea.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wide text-theme-text-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 p-6 shadow-inner">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#f97316]">
            <Lightbulb className="h-3.5 w-3.5" />
            Idea sparks
          </span>
          <h3 className="text-lg font-semibold text-white">Try these angles:</h3>
          <p className="text-xs text-white/60">
            {sourceLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-[#f97316]/60 hover:text-[#f97316]"
          aria-label="Get new prompts"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {ideas.map((idea, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm leading-relaxed text-white/80">
              {idea.text}
            </p>
            {idea.tags && idea.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {idea.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white/40"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
