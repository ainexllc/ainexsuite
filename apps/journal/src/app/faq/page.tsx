'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FooterPageLayout } from '@ainexsuite/ui/components';

type FAQCategory = 'Practice' | 'Sharing' | 'Account';

type FAQItem = {
  question: string;
  answer: string;
  category: FAQCategory;
};

const faqItems: FAQItem[] = [
  {
    category: 'Practice',
    question: 'Do I need to journal every day?',
    answer:
      'Not at all. Journey adapts to your cadence. You can set weekly or seasonal check-ins, and we’ll keep your momentum going with prompts when you’re ready.',
  },
  {
    category: 'Practice',
    question: 'Can I import entries from other apps?',
    answer:
      'Yes. Import from Day One, Notion, Apple Notes, or Markdown files. Journey keeps original timestamps and media intact.',
  },
  {
    category: 'Sharing',
    question: 'How do shared collections work?',
    answer:
      'Create a collection, add the entries you want, and invite collaborators with view or comment access. You can redact sensitive sections before sharing.',
  },
  {
    category: 'Sharing',
    question: 'Will collaborators be notified when I write?',
    answer:
      'Only if you choose. You can send weekly recaps, immediate updates, or keep new entries private until you publish them.',
  },
  {
    category: 'Account',
    question: 'What happens if I cancel my subscription?',
    answer:
      'You retain access until the end of the billing period. We keep your data available for 90 days so you can export or reactivate anytime.',
  },
  {
    category: 'Account',
    question: 'Is Journey available on mobile?',
    answer:
      'iOS and Android apps let you capture thoughts anywhere. They support offline drafting, photo uploads, and quick voice notes.',
  },
];

const categories: FAQCategory[] = ['Practice', 'Sharing', 'Account'];

export default function JourneyFAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('Practice');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = faqItems.filter((item) => item.category === activeCategory);

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-violet-300">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Journey FAQ</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Quick answers about journaling flows, sharing, and account management. Need more? Email{' '}
            <a href="mailto:journey@ainexspace.com" className="text-violet-300 hover:underline">
              journey@ainexspace.com
            </a>
            .
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
                  ? 'bg-violet-500 text-white'
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
                    <ChevronUp className="h-5 w-5 text-violet-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-violet-300 flex-shrink-0" />
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
