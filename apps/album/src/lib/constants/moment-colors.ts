/**
 * Moment Color Palette - Simplified color options for moments
 */
export type MomentColor = 'default' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'slate';

export const MOMENT_COLORS: Array<{
  id: MomentColor;
  label: string;
  swatchClass: string;
  cardClass: string;
}> = [
  {
    id: 'default',
    label: 'Default',
    swatchClass: 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
    cardClass: 'bg-zinc-50 dark:bg-zinc-900',
  },
  {
    id: 'rose',
    label: 'Rose',
    swatchClass: 'bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800',
    cardClass: 'bg-pink-50 dark:bg-pink-950',
  },
  {
    id: 'amber',
    label: 'Amber',
    swatchClass: 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800',
    cardClass: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatchClass: 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800',
    cardClass: 'bg-emerald-50 dark:bg-emerald-950',
  },
  {
    id: 'sky',
    label: 'Sky',
    swatchClass: 'bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800',
    cardClass: 'bg-sky-50 dark:bg-sky-950',
  },
  {
    id: 'violet',
    label: 'Violet',
    swatchClass: 'bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800',
    cardClass: 'bg-violet-50 dark:bg-violet-950',
  },
  {
    id: 'slate',
    label: 'Slate',
    swatchClass: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    cardClass: 'bg-slate-100 dark:bg-slate-800',
  },
];
