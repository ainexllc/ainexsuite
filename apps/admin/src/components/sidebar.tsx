'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Shield,
  Menu
} from 'lucide-react';
import { AinexStudiosLogo } from '@ainexsuite/ui/components';
import { clsx } from 'clsx';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Feedback', href: '/feedback', icon: MessageSquare },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface AdminSidebarProps {
  onSignOut: () => void;
}

export function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950">
        <div className="flex items-center gap-2 text-white font-bold">
          <Shield className="h-5 w-5 text-indigo-500" />
          <span>Admin</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-zinc-400">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-white/10 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Shield className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">Admin Portal</h1>
                <p className="text-xs text-zinc-500">Mission Control</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <p className="px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Platform
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 space-y-4">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
            
            <div className="pt-4 flex justify-center opacity-50">
              <AinexStudiosLogo size="sm" asLink={false} />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
