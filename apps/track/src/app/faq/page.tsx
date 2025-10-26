'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FooterPageLayout } from '@/components/footer-page-layout';

type FAQCategory = 'Habits & Routines' | 'Collaboration' | 'Account & Billing';

type FAQItem = {
  question: string;
  answer: string;
  category: FAQCategory;
};

const faqItems: FAQItem[] = [
  {
    category: 'Habits & Routines',
    question: 'How does Track calculate streaks?',
    answer:
      'Track scores each habit using completion, intensity, and recovery signals. Missed days adjust your momentum curve instead of resetting to zero, so progress feels realistic.',
  },
  {
    category: 'Habits & Routines',
    question: 'Can I set different cadences for habits?',
    answer:
      'Absolutely. Create daily, weekly, or custom schedules. You can also stack habits into routines with dependencies and buffer time between actions.',
  },
  {
    category: 'Collaboration',
    question: 'What can collaborators see?',
    answer:
      'You choose. Share summary dashboards, individual habits, or reflection notes. Permissions can hide sensitive context while still showing progress trends.',
  },
  {
    category: 'Collaboration',
    question: 'Do collaborators receive notifications?',
    answer:
      'If you enable them. Accountability partners can get weekly recaps, milestone alerts, or real-time nudges when you request support.',
  },
  {
    category: 'Account & Billing',
    question: 'Can I export my data?',
    answer:
      'Yes. Export habits, reflections, and analytics anytime as CSV or Markdown. Integrations with Notes and Todo also keep insights flowing across the suite.',
  },
  {
    category: 'Account & Billing',
    question: 'Is there an offline mode?',
    answer:
      'The mobile apps cache your latest routines and reflections. When you reconnect, Track syncs everything automatically.',
  },
];

const categories: FAQCategory[] = ['Habits & Routines', 'Collaboration', 'Account & Billing'];

export default function TrackFAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('Habits & Routines');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = faqItems.filter((item) => item.category === activeCategory);

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Track FAQ</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Everything you need to know about building habits, inviting collaborators, and managing your Track account.
            Reach us at{' '}
            <a href="mailto:track@ainexsuite.com" className="text-amber-300 hover:underline">
              track@ainexsuite.com
            </a>{' '}
            if you have more questions.
          </p>
        </section>

        <section className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category);
                setOpenQuestion(null);
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeCategory === category
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-800/80 text-white/70 hover:bg-zinc-700/80'
              }`}
            >
              {category}
            </button>
          ))}
        </section>

        <section className="space-y-4">
          {filteredFaqs.map((item, index) => {
            const key = `${item.category}-${index}`;
            const isOpen = openQuestion === key;

            return (
              <div key={key} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                <button
                  type="button"
                  onClick={() => setOpenQuestion(isOpen ? null : key)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-lg font-semibold text-white">{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-amber-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-amber-300 flex-shrink-0" />
                  )}
                </button>
                {isOpen && <p className="mt-4 text-sm text-white/70 leading-relaxed">{item.answer}</p>}
              </div>
            );
          })}
        </section>
      </div>
    </FooterPageLayout>
  );
}
