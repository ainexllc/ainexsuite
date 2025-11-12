import { createContext, useContext } from 'react';

export type GradientVariantId = 'ember-glow' | 'aurora-mist';

export interface GradientVariant {
  id: GradientVariantId;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  // Add more properties as needed for gradients/CSS vars
}

export const gradientVariants: GradientVariant[] = [
  {
    id: 'ember-glow',
    name: 'Ember Glow',
    primary: '#ef4444',
    secondary: '#f59e0b',
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
  },
  {
    id: 'aurora-mist',
    name: 'Aurora Mist',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
];

export const defaultGradientVariant: GradientVariant = gradientVariants[0];

export const getVariantById = (id: GradientVariantId): GradientVariant => {
  const variant = gradientVariants.find(v => v.id === id);
  return variant || defaultGradientVariant;
};

export const getNextVariant = (currentId: GradientVariantId): GradientVariant => {
  const currentIndex = gradientVariants.findIndex(v => v.id === currentId);
  const nextIndex = (currentIndex + 1) % gradientVariants.length;
  return gradientVariants[nextIndex];
};

interface VisualStyleContextType {
  variants: GradientVariant[];
  selectedVariant: GradientVariant;
  selectVariantById: (id: GradientVariantId) => void;
  cycleVariant: () => void;
}

const VisualStyleContext = createContext<VisualStyleContextType | undefined>(undefined);

export const useVisualStyle = () => {
  const context = useContext(VisualStyleContext);
  if (!context) {
    throw new Error('useVisualStyle must be used within VisualStyleContext');
  }
  return context;
};

export { VisualStyleContext };
