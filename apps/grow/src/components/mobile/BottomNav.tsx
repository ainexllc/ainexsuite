'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart3, Plus, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  isAction?: boolean;
}

interface BottomNavProps {
  onAddHabit?: () => void;
  canAddHabit?: boolean;
  addHabitReason?: string;
}

export function BottomNav({ onAddHabit, canAddHabit = true, addHabitReason }: BottomNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/workspace', icon: Home, label: 'Home' },
    { href: '/workspace/analytics', icon: BarChart3, label: 'Stats' },
    { href: '#add', icon: Plus, label: 'Add', isAction: true },
    { href: '/workspace/settings', icon: Settings, label: 'Settings' },
    { href: '/workspace/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/10 pb-safe md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isAction) {
            return (
              <button
                key={item.href}
                onClick={canAddHabit ? onAddHabit : undefined}
                disabled={!canAddHabit}
                className="flex flex-col items-center justify-center -mt-6"
                title={canAddHabit ? 'Add habit' : addHabitReason}
              >
                <div className={cn(
                  'h-14 w-14 rounded-full flex items-center justify-center transition-transform',
                  canAddHabit
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 active:scale-95'
                    : 'bg-white/10'
                )}>
                  <Icon className={cn('h-6 w-6', canAddHabit ? 'text-white' : 'text-white/40')} />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px]',
                isActive
                  ? 'text-indigo-400'
                  : 'text-white/40 active:text-white/60'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-indigo-400')} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
