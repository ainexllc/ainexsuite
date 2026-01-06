'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FooterPageLayout } from '@ainexsuite/ui/components';

type FAQItem = {
  category: 'Capture' | 'Organization' | 'Account';
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    category: 'Capture',
    question: 'Can Notes handle handwritten or voice input?',
    answer:
      'Yes. Upload handwriting scans or record voice notes and Notes converts them into searchable text. AI tags the content so it flows into the right collections automatically.',
  },
  {
    category: 'Capture',
    question: 'Do you support templates for recurring documents?',
    answer:
      'Absolutely. Save any note as a template—meeting notes, design briefs, research outlines—and reuse it with pre-filled sections and prompts.',
  },
  {
    category: 'Organization',
    question: 'How do AI tags and collections work?',
    answer:
      'Notes detects topics, people, projects, and sentiment while you write. It recommends tags and collections, building a semantic knowledge graph you can browse and search instantly.',
  },
  {
    category: 'Organization',
    question: 'Can I collaborate with teammates?',
    answer:
      'On Collaborate and Knowledge Ops plans you can invite teammates to shared workspaces, comment inline, assign tasks, and share read-only views externally.',
  },
  {
    category: 'Account',
    question: 'What happens if I downgrade or cancel?',
    answer:
      'You maintain access through the end of your billing period. We keep your data for 90 days so you can export everything or reactivate without losing context.',
  },
  {
    category: 'Account',
    question: 'Is my content secure?',
    answer:
      'Yes. All plans include encryption at rest and in transit, access logs, and optional zero-knowledge vaults. Enterprise customers can configure custom retention and compliance settings.',
  },
];

const categories = ['Capture', 'Organization', 'Account'] as const;

export default function NotesFAQPage() {
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('Capture');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = faqItems.filter((item) => item.category === activeCategory);

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-accent-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-accent-300">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Notes FAQ</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Everything you need to know about capturing, organizing, and sharing knowledge with Notes. Still curious? Email{' '}
            <a href="mailto:notes@ainexspace.com" className="text-accent-300 hover:underline">
              notes@ainexspace.com
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
                activeCategory === category ? 'bg-accent-500 text-white' : 'bg-zinc-800/80 text-white/70 hover:bg-zinc-700/80'
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
                    <ChevronUp className="h-5 w-5 text-accent-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-accent-300 flex-shrink-0" />
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
