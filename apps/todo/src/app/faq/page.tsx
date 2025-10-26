'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FooterPageLayout } from '@/components/footer-page-layout';

type FAQItem = {
  category: 'Planning' | 'Automation' | 'Account';
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    category: 'Planning',
    question: 'How are task priorities determined?',
    answer:
      'Todo looks at deadlines, estimated effort, dependencies, and your focus goals. It then ranks tasks dynamically. You can always override the order or pin must-do items.',
  },
  {
    category: 'Planning',
    question: 'Can I manage personal and team tasks together?',
    answer:
      'Yes. Use spaces or filters to separate personal lists from shared boards. Focus mode combines them so you see a single daily slate.',
  },
  {
    category: 'Automation',
    question: 'What automations are available?',
    answer:
      'Create rules for recurring tasks, auto-tagging, handoffs, or status updates. For example: when a design task is marked done, notify the product manager and queue the next review.',
  },
  {
    category: 'Automation',
    question: 'Do you integrate with Jira or Notion?',
    answer:
      'Yes. Todo syncs tasks with Jira, Notion, Linear, and other project tools so high-level projects and daily execution stay aligned.',
  },
  {
    category: 'Account',
    question: 'What happens if my team exceeds our seat count?',
    answer:
      'We’ll prompt you to add seats at the prorated rate. You can also downgrade or reassign seats anytime from the billing dashboard.',
  },
  {
    category: 'Account',
    question: 'Is my data secure?',
    answer:
      'Yes. All plans include encryption, audit logs, and export controls. Enterprise customers can enforce SSO, retention policies, and advanced auditing.',
  },
];

const categories = ['Planning', 'Automation', 'Account'] as const;

export default function TodoFAQPage() {
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('Planning');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = faqItems.filter((item) => item.category === activeCategory);

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Todo FAQ</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Answers about planning, automations, and account management. Still have questions? Email{' '}
            <a href="mailto:todo@ainexsuite.com" className="text-emerald-300 hover:underline">
              todo@ainexsuite.com
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
                activeCategory === category ? 'bg-emerald-500 text-white' : 'bg-zinc-800/80 text-white/70 hover:bg-zinc-700/80'
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
                    <ChevronUp className="h-5 w-5 text-emerald-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-emerald-300 flex-shrink-0" />
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
