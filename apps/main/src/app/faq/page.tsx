'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'What is AINexSuite?',
        answer: 'AINexSuite is a comprehensive productivity platform that brings together 8 AI-powered apps to help you track, understand, and improve every aspect of your life. From journaling and habit tracking to task management and fitness monitoring, all your productivity tools work together in one seamless workspace.',
      },
      {
        question: 'How do I get started?',
        answer: 'Simply sign up with your Google account or email on our homepage. Once registered, you\'ll have immediate access to all 8 apps in the suite. We recommend starting with the Journal app to set your intentions, then exploring the other apps based on your goals.',
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes! We offer a 14-day free trial with full access to all features across all 8 apps. No credit card required to start. After the trial, you can choose a plan that works best for you.',
      },
      {
        question: 'Do I need to download anything?',
        answer: 'No downloads required! AINexSuite is a web-based platform accessible from any modern browser. Simply visit our website, sign in, and start using all the apps immediately. We also offer progressive web app (PWA) capabilities for a native app-like experience.',
      },
    ],
  },
  {
    title: 'Account & Billing',
    items: [
      {
        question: 'How do I change my password?',
        answer: 'If you signed up with email and password, go to your account settings and select "Change Password". If you signed up with Google, your password is managed through your Google account.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. All payments are processed securely through Stripe, and we never store your payment information on our servers.',
      },
      {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Absolutely! You can cancel your subscription at any time from your account settings. You\'ll continue to have access until the end of your current billing period, and your data will be preserved for 90 days if you decide to return.',
      },
      {
        question: 'Do you offer refunds?',
        answer: 'We offer a 30-day money-back guarantee for all new subscriptions. If you\'re not satisfied within the first 30 days, contact our support team for a full refund, no questions asked.',
      },
    ],
  },
  {
    title: 'Features & Apps',
    items: [
      {
        question: 'What apps are included in AINexSuite?',
        answer: 'AINexSuite includes 8 specialized apps: Journal (daily reflections and AI insights), Track (habit tracking and streaks), Todo (task management and priorities), Moments (photo diary and memories), Grow (goal setting and achievement), Pulse (mood and energy tracking), Fit (health and fitness monitoring), and Notes (quick capture and organization).',
      },
      {
        question: 'How does the AI work?',
        answer: 'Our AI analyzes patterns across all your data to provide personalized insights and recommendations. For example, it might notice that you\'re more productive on days when you exercise, or that certain habits correlate with better mood scores. The AI learns from your usage without compromising your privacy.',
      },
      {
        question: 'Can I use just one app instead of the whole suite?',
        answer: 'While all apps are included in your subscription, you\'re free to use only the ones that fit your needs. However, the real power of AINexSuite comes from the integration between apps—insights from your journal can inform habit tracking, fitness data can correlate with mood, and so on.',
      },
      {
        question: 'Can I export my data?',
        answer: 'Yes! You own your data and can export it anytime in multiple formats including JSON, CSV, and PDF. Go to Settings > Data & Privacy > Export Data to download a complete archive of all your information across all apps.',
      },
      {
        question: 'Do the apps work offline?',
        answer: 'Yes, many features work offline through progressive web app technology. Your data will sync automatically when you reconnect to the internet. Core features like journaling, task management, and habit tracking are all available offline.',
      },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use industry-standard encryption (AES-256) to protect your data both in transit and at rest. All connections use HTTPS, and we employ multi-factor authentication options. Your data is stored in secure, SOC 2 compliant data centers.',
      },
      {
        question: 'Who can see my data?',
        answer: 'Only you. Your data is private by default and never shared with third parties. We don\'t sell your data, use it for advertising, or share it with anyone without your explicit consent. Even our team cannot access your personal content.',
      },
      {
        question: 'Do you use my data to train AI models?',
        answer: 'No. We never use your personal content to train AI models. The AI insights you receive are generated using models trained on public data, and your personal information stays completely private and is only used to provide you with personalized features.',
      },
      {
        question: 'What happens to my data if I delete my account?',
        answer: 'When you delete your account, all your data is permanently removed from our servers within 30 days, in compliance with GDPR and data protection regulations. You can also request an immediate deletion by contacting our support team.',
      },
      {
        question: 'Are you GDPR compliant?',
        answer: 'Yes, we are fully GDPR compliant. We respect your data rights including the right to access, rectify, delete, and export your data. Our privacy policy outlines exactly how we handle your information.',
      },
    ],
  },
  {
    title: 'Technical Support',
    items: [
      {
        question: 'What browsers are supported?',
        answer: 'AINexSuite works best on modern browsers including Chrome (90+), Firefox (88+), Safari (14+), and Edge (90+). We recommend keeping your browser updated for the best experience and security.',
      },
      {
        question: 'I found a bug. How do I report it?',
        answer: 'We appreciate bug reports! Please email support@ainexsuite.com with details about the issue, including what browser you\'re using, what you were doing when the bug occurred, and any error messages you saw. Screenshots are helpful too!',
      },
      {
        question: 'Is there a mobile app?',
        answer: 'Currently, AINexSuite is a progressive web app (PWA) that works great on mobile browsers and can be installed to your home screen for an app-like experience. Native iOS and Android apps are planned for future release.',
      },
      {
        question: 'How do I contact support?',
        answer: 'You can reach our support team at support@ainexsuite.com. We typically respond within 24 hours on business days. For urgent issues, premium subscribers have access to priority support with faster response times.',
      },
      {
        question: 'Do you have documentation or tutorials?',
        answer: 'Yes! Visit our Help Center for comprehensive guides, video tutorials, and best practices for each app. We also have a growing library of articles on productivity, habit formation, and personal growth.',
      },
    ],
  },
];

function FAQAccordion({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-800/80 overflow-hidden transition-all">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white pr-4">{item.question}</h3>
        <ChevronDown
          className={`h-5 w-5 text-white/60 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-white/70 leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const handleToggle = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Find answers to common questions about AINexSuite. Can’t find what you’re looking for?{' '}
            <a href="mailto:support@ainexsuite.com" className="text-[#f97316] hover:underline">
              Contact our support team
            </a>
            .
          </p>
        </div>

        {/* FAQ Categories */}
        {faqData.map((category, categoryIndex) => (
          <div key={category.title} className="space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-6">{category.title}</h2>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <FAQAccordion
                  key={`${categoryIndex}-${itemIndex}`}
                  item={item}
                  isOpen={openIndex === `${categoryIndex}-${itemIndex}`}
                  onClick={() => handleToggle(categoryIndex, itemIndex)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions CTA */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 lg:p-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Still have questions?</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Our support team is here to help. We typically respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@ainexsuite.com"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/help"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              Visit Help Center
            </a>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
