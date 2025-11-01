'use client';

import { createContext, useContext } from 'react';

export type GradientVariantId = 'aurora-mist' | 'ember-glow';

export interface GradientVariant {
  id: GradientVariantId;
  label: string;
  heroAtmosphere: string;
  heroTopGlow: string;
  heroSideGlow: string;
  headlineGradient: string;
  featureIconWrapper: string;
  loginBackdrop: string;
  loginCardBorder: string;
  loginCardShadow: string;
  badgeStyles: string;
  accentIcon: string;
  focusRing: string;
  primaryButton: string;
  googleIcon: string;
  switchLink: string;
  themeSwatches: string[];
  loadingPulse: string;
  loaderColor: string;
  loaderDot: string;
  cardGlow: string;
}

export const gradientVariants: readonly GradientVariant[] = [
  {
    id: 'aurora-mist',
    label: 'Aurora Mist',
    heroAtmosphere:
      'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),rgba(5,5,5,0.97)_65%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.16),rgba(5,5,5,0.98)_80%)]',
    heroTopGlow: 'bg-cyan-400/20',
    heroSideGlow: 'bg-sky-500/20',
    headlineGradient: 'from-sky-300 via-cyan-200 to-sky-200',
    featureIconWrapper: 'bg-sky-400/15 text-sky-200',
    loginBackdrop: 'from-sky-400/15 via-transparent to-sky-600/20',
    loginCardBorder: 'border-cyan-400/25',
    loginCardShadow: 'shadow-[0_25px_80px_-25px_rgba(56,189,248,0.35)]',
    badgeStyles: 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100',
    accentIcon: 'text-cyan-200',
    focusRing: 'focus:ring-cyan-400',
    primaryButton:
      'bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 text-slate-900 hover:from-sky-300 hover:via-cyan-300 hover:to-sky-400',
    googleIcon: 'text-sky-300',
    switchLink: 'text-cyan-200 hover:text-cyan-100',
    themeSwatches: ['bg-sky-400/80', 'bg-cyan-400/70', 'bg-sky-500/60'],
    loadingPulse: 'bg-sky-400/20',
    loaderColor: 'text-sky-300',
    loaderDot: 'bg-sky-400',
    cardGlow: 'border-cyan-400/20 shadow-[0_12px_40px_-20px_rgba(56,189,248,0.5)]',
  },
  {
    id: 'ember-glow',
    label: 'Ember Glow',
    heroAtmosphere:
      'bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),rgba(5,5,5,0.95)_55%),radial-gradient(circle_at_bottom,rgba(234,88,12,0.18),rgba(5,5,5,0.95)_65%)]',
    heroTopGlow: 'bg-[#f97316]/35',
    heroSideGlow: 'bg-[#ea580c]/30',
    headlineGradient: 'from-[#FF7A18] to-[#FFB347]',
    featureIconWrapper: 'bg-[#f97316]/10 text-[#f97316]',
    loginBackdrop: 'from-[#f97316]/15 via-transparent to-[#ea580c]/20',
    loginCardBorder: 'border-[#f97316]/20',
    loginCardShadow: 'shadow-[0_25px_80px_-25px_rgba(249,115,22,0.35)]',
    badgeStyles: 'border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316]',
    accentIcon: 'text-[#f97316]',
    focusRing: 'focus:ring-[#f97316]',
    primaryButton: 'bg-[#f97316] text-white hover:bg-[#ea6a0f]',
    googleIcon: 'text-[#f97316]',
    switchLink: 'text-[#f97316] hover:text-[#ea6a0f]',
    themeSwatches: ['bg-[#FF7A18]', 'bg-[#FFB347]', 'bg-[#f97316]/40'],
    loadingPulse: 'bg-[#f97316]/20',
    loaderColor: 'text-[#f97316]',
    loaderDot: 'bg-[#f97316]',
    cardGlow: 'border-[#f97316]/20 shadow-[0_12px_40px_-20px_rgba(249,115,22,0.55)]',
  },
] as const;

export const defaultGradientVariant = gradientVariants[0];

export function getVariantById(id: GradientVariantId): GradientVariant {
  return gradientVariants.find((variant) => variant.id === id) ?? defaultGradientVariant;
}

export function getNextVariant(currentId: GradientVariantId): GradientVariant {
  const index = gradientVariants.findIndex((variant) => variant.id === currentId);
  const nextIndex = index === -1 ? 0 : (index + 1) % gradientVariants.length;
  return gradientVariants[nextIndex];
}

export interface VisualStyleContextValue {
  variants: readonly GradientVariant[];
  selectedVariant: GradientVariant;
  selectVariantById: (id: GradientVariantId) => void;
  cycleVariant: () => void;
}

export const VisualStyleContext = createContext<VisualStyleContextValue | undefined>(undefined);

export function useVisualStyle(): VisualStyleContextValue {
  const context = useContext(VisualStyleContext);
  if (!context) {
    throw new Error('useVisualStyle must be used within VisualStyleProvider');
  }
  return context;
}
