'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Zap, Crown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export interface MarketingSlide {
  id: string;
  title: string;
  description: string;
  cta: {
    text: string;
    href: string;
  };
  icon: React.ElementType;
  gradient: {
    from: string;
    to: string;
  };
  image?: string;
}

interface MarketingSlideshowProps {
  slides?: MarketingSlide[];
  autoPlayInterval?: number; // in milliseconds
}

const defaultSlides: MarketingSlide[] = [
  {
    id: '1',
    title: 'Unlock AI-Powered Insights',
    description: 'Get personalized recommendations and smart analytics across all your apps.',
    cta: {
      text: 'Upgrade to Pro',
      href: '/plans',
    },
    icon: Sparkles,
    gradient: {
      from: '#8b5cf6',
      to: '#ec4899',
    },
  },
  {
    id: '2',
    title: 'Lightning Fast Performance',
    description: 'Experience blazing speed with our optimized cloud infrastructure.',
    cta: {
      text: 'Learn More',
      href: '/features',
    },
    icon: Zap,
    gradient: {
      from: '#f59e0b',
      to: '#ef4444',
    },
  },
  {
    id: '3',
    title: 'Premium Features Await',
    description: 'Unlock unlimited storage, advanced analytics, and priority support.',
    cta: {
      text: 'View Plans',
      href: '/plans',
    },
    icon: Crown,
    gradient: {
      from: '#10b981',
      to: '#06b6d4',
    },
  },
  {
    id: '4',
    title: 'Track Your Progress',
    description: 'Visualize your growth with comprehensive analytics and insights.',
    cta: {
      text: 'See Analytics',
      href: '/workspace',
    },
    icon: TrendingUp,
    gradient: {
      from: '#3b82f6',
      to: '#8b5cf6',
    },
  },
];

export function MarketingSlideshow({
  slides = defaultSlides,
  autoPlayInterval = 5000,
}: MarketingSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPaused, autoPlayInterval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-border bg-background/20 backdrop-blur-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative h-[280px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Gradient Background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${slide.gradient.from} 0%, ${slide.gradient.to} 100%)`,
              }}
            />

            {/* Glow Effects */}
            <div
              className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-30"
              style={{ backgroundColor: slide.gradient.from }}
            />
            <div
              className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full blur-[100px] opacity-25"
              style={{ backgroundColor: slide.gradient.to }}
            />

            {/* Content */}
            <div className="relative z-10 flex items-center h-full px-8 py-6">
              <div className="flex items-center gap-6 max-w-4xl">
                {/* Icon */}
                <div
                  className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl border border-border bg-foreground/10 backdrop-blur-sm"
                  style={{
                    boxShadow: `0 0 40px ${slide.gradient.from}40`,
                  }}
                >
                  <IconComponent
                    className="w-10 h-10"
                    style={{ color: slide.gradient.from }}
                  />
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-3">
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                    {slide.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={slide.cta.href}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${slide.gradient.from} 0%, ${slide.gradient.to} 100%)`,
                      color: 'white',
                    }}
                  >
                    {slide.cta.text}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6">
        {/* Dots Indicator */}
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-foreground'
                  : 'w-1.5 bg-foreground/30 hover:bg-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Prev/Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/10 border border-border text-muted-foreground hover:bg-foreground/20 hover:text-foreground transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/10 border border-border text-muted-foreground hover:bg-foreground/20 hover:text-foreground transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
