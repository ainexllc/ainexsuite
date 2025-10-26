"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FooterPageLayout } from "@/components/footer-page-layout";

type FAQItem = {
  question: string;
  answer: string;
  category: "Training" | "Recovery" | "Account";
};

const faqItems: FAQItem[] = [
  {
    category: "Training",
    question: "How does Fit adjust my programming?",
    answer:
      "Fit tracks readiness, bar velocity, session RPE, and recovery trends. When indicators show overload or under-recovery, we automatically recommend volume or intensity changes. You can accept suggestions, tweak them, or lock in a plan manually.",
  },
  {
    category: "Training",
    question: "Can I import workouts from my spreadsheet?",
    answer:
      "Yes. Upload CSV or Excel templates and Fit converts them into reusable programming blocks. You can then apply them to future phases or share them with athletes and clients.",
  },
  {
    category: "Recovery",
    question: "Do I need a wearable to use Fit?",
    answer:
      "Wearables enhance insights, but they’re optional. You can log sleep, HRV, and recovery scores manually. When you connect Garmin, Apple Health, or WHOOP, Fit automatically blends that data into readiness scoring.",
  },
  {
    category: "Recovery",
    question: "How accurate are the readiness scores?",
    answer:
      "Readiness scores combine sleep debt, HRV trends, session RPE, and muscle group freshness. While no model can predict perfectly, Fit highlights the specific variables driving your score so you can make informed adjustments.",
  },
  {
    category: "Account",
    question: "Can I invite my coach or physical therapist?",
    answer:
      "Absolutely. Fit supports unlimited collaborators on Coach and Performance Team plans. Assign access levels so coaches can edit programming, while medical staff can review notes and load trends.",
  },
  {
    category: "Account",
    question: "What happens if I cancel my subscription?",
    answer:
      "You keep access through the end of your billing period. After that, you can export all training history, metrics, and media. We retain data for 90 days in case you reactivate.",
  },
];

const categories = ["Training", "Recovery", "Account"] as const;

export default function FitFAQPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>("Training");

  const filteredItems = faqItems.filter((item) => item.category === activeCategory);

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-orange-400">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Answers for high performers</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Everything you need to know about using AINex Fit as an athlete or coach. Still have
            questions? Email <a href="mailto:fit@ainexsuite.com" className="text-orange-400 hover:underline">fit@ainexsuite.com</a>.
          </p>
        </section>

        <section className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeCategory === category ? "bg-orange-500 text-white" : "bg-zinc-800/80 text-white/70 hover:bg-zinc-700/80"
              }`}
            >
              {category}
            </button>
          ))}
        </section>

        <section className="space-y-4">
          {filteredItems.map((item, index) => {
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
                    <ChevronUp className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-orange-400 flex-shrink-0" />
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
