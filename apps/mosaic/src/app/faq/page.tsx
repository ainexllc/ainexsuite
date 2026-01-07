'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FooterPageLayout } from '@ainexsuite/ui/components';

type FAQCategory = 'Vitals & Data' | 'Collaboration' | 'Account & Billing';

type FAQItem = {
  question: string;
  answer: string;
  category: FAQCategory;
};

const faqItems: FAQItem[] = [
  {
    category: 'Vitals & Data',
    question: 'How often does Pulse refresh my device data?',
    answer:
      'Most wearable integrations update every few minutes. Labs and manual entries appear instantly. You can trigger a manual sync anytime from the dashboard.',
  },
  {
    category: 'Vitals & Data',
    question: 'Can I import lab results from multiple clinics?',
    answer:
      'Yes. Upload PDFs, connect supported labs, or forward emails to your Pulse inbox. We parse each file, extract key values, and trend them alongside your biometric timeline.',
  },
  {
    category: 'Collaboration',
    question: 'How do I invite my coach or doctor?',
    answer:
      'Share a secure link from the Collaborators panel. Choose what data they see (vitals, notes, labs) and whether they receive alerts. You can revoke access instantly.',
  },
  {
    category: 'Collaboration',
    question: 'Will collaborators need their own subscription?',
    answer:
      'Guests invited by Personal plans do not need a paid seat. Pro Team and Clinical plans include dedicated dashboards for collaborators and allow role-based permissions.',
  },
  {
    category: 'Account & Billing',
    question: 'Can I pause my membership?',
    answer:
      'You can pause for up to three months. During that time Pulse keeps your data secure and read-only. Reactivate anytime without losing history or automations.',
  },
  {
    category: 'Account & Billing',
    question: 'What support is available?',
    answer:
      'All plans include email support and an in-app knowledge base. Pro Team adds live chat on weekdays, while Clinical customers receive a dedicated success partner.',
  },
];

const categories: FAQCategory[] = ['Vitals & Data', 'Collaboration', 'Account & Billing'];

export default function PulseFAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('Vitals & Data');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = faqItems.filter((item) => item.category === activeCategory);

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-rose-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Pulse FAQ</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Answers to common questions about syncing vitals, collaborating with providers, and managing your account.
            Need more help? Email{' '}
            <a href="mailto:pulse@ainexspace.com" className="text-rose-300 hover:underline">
              pulse@ainexspace.com
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
                  ? 'bg-rose-500 text-white'
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
                    <ChevronUp className="h-5 w-5 text-rose-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-rose-300 flex-shrink-0" />
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
