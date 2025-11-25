export interface DashboardTheme {
  id: string;
  name: string;
  bg: string;
  panel: string;
  panelHover: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBg: string;
  radius: string;
  font: string;
  shadow: string;
  bgSurface: string;
  bgHover: string;
}

export const DASHBOARD_THEMES: DashboardTheme[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    bg: 'bg-[#050505]',
    panel: 'bg-white/5 border border-white/10 backdrop-blur-sm',
    panelHover: 'hover:bg-white/10 hover:border-white/20',
    border: 'border-white/10',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    accent: 'text-sky-400',
    accentBg: 'bg-sky-500/10',
    radius: 'rounded-xl',
    font: 'font-sans',
    shadow: 'shadow-none',
    bgSurface: 'bg-white/5',
    bgHover: 'hover:bg-white/10'
  },
  {
    id: 'frosted',
    name: 'Frosted Glass',
    bg: 'bg-[url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")] bg-cover bg-fixed',
    panel: 'bg-white/5 backdrop-blur-xl border border-white/10',
    panelHover: 'hover:bg-white/10 hover:border-white/20',
    border: 'border-white/10',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-100/70',
    accent: 'text-cyan-300',
    accentBg: 'bg-cyan-400/20',
    radius: 'rounded-[32px]',
    font: 'font-sans',
    shadow: 'shadow-xl shadow-black/20',
    bgSurface: 'bg-white/5',
    bgHover: 'hover:bg-white/10'
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    bg: 'bg-slate-950',
    panel: 'bg-slate-900/50 border border-slate-800',
    panelHover: 'hover:bg-slate-900 hover:border-slate-700',
    border: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10',
    radius: 'rounded-2xl',
    font: 'font-sans',
    shadow: 'shadow-sm',
    bgSurface: 'bg-slate-800/50',
    bgHover: 'hover:bg-slate-800'
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    bg: 'bg-black',
    panel: 'bg-transparent border border-white/20',
    panelHover: 'hover:border-white/40',
    border: 'border-white/20',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-500',
    accent: 'text-white',
    accentBg: 'bg-white/10',
    radius: 'rounded-none',
    font: 'font-mono',
    shadow: 'shadow-none',
    bgSurface: 'bg-transparent border border-white/10',
    bgHover: 'hover:bg-white/5'
  },
  {
    id: 'luxury',
    name: 'Warm Luxury',
    bg: 'bg-[#1c1917]',
    panel: 'bg-[#292524] border border-[#44403c]',
    panelHover: 'hover:bg-[#44403c]',
    border: 'border-[#44403c]',
    textPrimary: 'text-[#fafaf9]',
    textSecondary: 'text-[#a8a29e]',
    accent: 'text-[#d6d3d1]',
    accentBg: 'bg-[#57534e]',
    radius: 'rounded-lg',
    font: 'font-serif',
    shadow: 'shadow-2xl',
    bgSurface: 'bg-[#44403c]/20',
    bgHover: 'hover:bg-[#44403c]/40'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk',
    bg: 'bg-[#050505]',
    panel: 'bg-black border border-zinc-800',
    panelHover: 'hover:border-fuchsia-500/50 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]',
    border: 'border-zinc-800',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-500',
    accent: 'text-fuchsia-400',
    accentBg: 'bg-fuchsia-500/10',
    radius: 'rounded-sm',
    font: 'font-sans',
    shadow: 'shadow-none',
    bgSurface: 'bg-zinc-900',
    bgHover: 'hover:bg-zinc-800'
  },
  {
    id: 'solid',
    name: 'Solid Flat',
    bg: 'bg-[#121212]',
    panel: 'bg-[#1E1E1E] border-none',
    panelHover: 'hover:bg-[#252525]',
    border: 'border-[#2C2C2C]',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-400',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    radius: 'rounded-xl',
    font: 'font-sans',
    shadow: 'shadow-lg',
    bgSurface: 'bg-[#252525]',
    bgHover: 'hover:bg-[#2C2C2C]'
  },
  {
    id: 'gradient',
    name: 'Gradient Mesh',
    bg: 'bg-black',
    panel: 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm',
    panelHover: 'hover:from-white/15 hover:to-white/5',
    border: 'border-white/10',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    accent: 'text-white',
    accentBg: 'bg-white/20',
    radius: 'rounded-3xl',
    font: 'font-sans',
    shadow: 'shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]',
    bgSurface: 'bg-white/5',
    bgHover: 'hover:bg-white/10'
  }
];

export const DEFAULT_THEME_ID = 'obsidian';

export function getTheme(id: string): DashboardTheme {
  return DASHBOARD_THEMES.find(t => t.id === id) || DASHBOARD_THEMES[0];
}
