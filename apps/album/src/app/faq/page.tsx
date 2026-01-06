'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FooterPageLayout } from '@ainexsuite/ui/components';

type FAQCategory = 'Capture & Editing' | 'Collaboration' | 'Account & Storage';

type FAQItem = {
  question: string;
  answer: string;
  category: FAQCategory;
};

const faqItems: FAQItem[] = [
  {
    category: 'Capture & Editing',
    question: 'What media formats can I import?',
    answer:
      'Moments supports photos (JPEG, PNG, RAW), videos (MP4, MOV, ProRes), and audio (WAV, MP3, AAC). You can also upload PDFs and text snippets for storytelling context.',
  },
  {
    category: 'Capture & Editing',
    question: 'Do I need professional editing skills?',
    answer:
      'No. Templates and AI assistants handle color grading, audio cleanup, and sequencing. You can still fine-tune every detail if you prefer manual control.',
  },
  {
    category: 'Collaboration',
    question: 'Can multiple people upload media at the same time?',
    answer:
      'Yes. Invite collaborators to a project and they can contribute simultaneously from the web or mobile apps. Uploads stay organized with auto-tagging and contributor labels.',
  },
  {
    category: 'Collaboration',
    question: 'How do client review portals work?',
    answer:
      'Share a secure link where clients can watch cuts, leave timestamped feedback, and approve scenes. You decide whether downloads are enabled.',
  },
  {
    category: 'Account & Storage',
    question: 'What happens if I hit my storage limit?',
    answer:
      'You’ll receive an alert and can archive older projects, add extra storage, or upgrade plans. Production House customers get discounted cold storage for long-term footage.',
  },
  {
    category: 'Account & Storage',
    question: 'Can I export all my assets if I leave?',
    answer:
      'Absolutely. Export entire projects with metadata, captions, and audio stems. We keep archives available for 90 days after cancellation.',
  },
];

const categories: FAQCategory[] = ['Capture & Editing', 'Collaboration', 'Account & Storage'];

export default function MomentsFAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('Capture & Editing');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = faqItems.filter((item) => item.category === activeCategory);

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-pink-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-pink-300">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Moments FAQ</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Answers about media capture, collaboration, and managing storage inside Moments. Have more questions? Email{' '}
            <a href="mailto:moments@ainexspace.com" className="text-pink-300 hover:underline">
              moments@ainexspace.com
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
                  ? 'bg-pink-500 text-white'
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
                    <ChevronUp className="h-5 w-5 text-pink-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-pink-300 flex-shrink-0" />
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
