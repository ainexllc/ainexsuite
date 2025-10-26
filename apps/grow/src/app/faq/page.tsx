'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FooterPageLayout } from '@/components/footer-page-layout';

type FAQItem = {
  question: string;
  answer: string;
  category: 'Learning' | 'Mentorship' | 'Account';
};

const faqItems: FAQItem[] = [
  {
    category: 'Learning',
    question: 'How does Grow personalize learning plans?',
    answer:
      'Grow looks at your goals, time availability, reflection scores, and quiz results. It then builds short sprints with recommended tasks, study blocks, and checkpoints. As you log progress, the AI adjusts the plan to keep momentum.',
  },
  {
    category: 'Learning',
    question: 'Can I bring in resources from outside apps?',
    answer:
      'Yes. Connect Readwise, Notion, or Google Drive to bring curated highlights or documents into the Knowledge Vault. You can also attach files or capture quick notes manually.',
  },
  {
    category: 'Mentorship',
    question: 'How do mentors collaborate in Grow?',
    answer:
      'Invite mentors as collaborators. They can review your reflections, leave comments, assign tasks, or record video feedback. Mentor plans include a shared dashboard showing learner momentum and open questions.',
  },
  {
    category: 'Mentorship',
    question: 'Can I work with multiple mentors or accountability partners?',
    answer:
      'Absolutely. You can add mentors, peers, and accountability partners to individual goals or boards. Permissions ensure each collaborator sees only what they need.',
  },
  {
    category: 'Account',
    question: 'What happens if I pause or cancel my subscription?',
    answer:
      'You retain read-only access until the end of your billing period. We preserve your data for 90 days so you can export it or reactivate without losing progress.',
  },
  {
    category: 'Account',
    question: 'Is my data private?',
    answer:
      'Yes. Every plan includes encryption, role-based access, and clear export controls. We never sell learning data. Academy customers can configure custom retention policies.',
  },
];

const categories = ['Learning', 'Mentorship', 'Account'] as const;

export default function GrowFAQPage() {
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('Learning');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = faqItems.filter((item) => item.category === activeCategory);

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-purple-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-purple-300">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Grow FAQ</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Quick answers about goals, mentors, and account management in Grow. Still curious? Email{' '}
            <a href="mailto:grow@ainexsuite.com" className="text-purple-300 hover:underline">
              grow@ainexsuite.com
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
                activeCategory === category ? 'bg-purple-500 text-white' : 'bg-zinc-800/80 text-white/70 hover:bg-zinc-700/80'
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
                    <ChevronUp className="h-5 w-5 text-purple-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-purple-300 flex-shrink-0" />
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
