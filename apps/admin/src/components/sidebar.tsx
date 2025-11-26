'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  Menu,
  LayoutGrid,
  Sparkles,
  X
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
  { label: 'Apps', href: '/apps', icon: LayoutGrid },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Feedback', href: '/feedback', icon: MessageSquare },
  { label: 'Updates', href: '/updates', icon: Sparkles },
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
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-md fixed top-0 inset-x-0 z-50">
        <div className="flex items-center gap-2 text-white font-bold">
          <Shield className="h-5 w-5 text-cyan-400" />
          <span className="tracking-widest font-mono text-sm">ADMIN_OS_v2.0</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={clsx(
        "fixed top-6 bottom-6 left-6 z-50 w-64 transition-transform duration-300 ease-out md:translate-x-0 md:static",
        "bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-[150%] md:translate-x-0 md:h-[calc(100vh-3rem)] md:my-6 md:ml-6 md:mr-0"
      )}>
        {/* Cyberpunk Gradient Line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />

        <div className="h-full flex flex-col relative">
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Header */}
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="font-black text-white text-xl font-bebas tracking-wider">NEXUS</h1>
                <p className="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">Admin Terminal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2 px-4 space-y-1 relative z-10">
            <p className="px-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 mt-2 font-mono">
              Modules
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
                    "w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {/* Active Background Gradient */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl" />
                  )}
                  
                  {/* Hover Glow */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  )}

                  <item.icon className={clsx(
                    "h-5 w-5 relative z-10 transition-colors duration-300", 
                    isActive ? "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.8)]" : "group-hover:text-white"
                  )} />
                  <span className="relative z-10 font-kanit tracking-wide">{item.label}</span>
                  
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,1)] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 mt-auto relative z-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm mb-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-xs font-mono text-emerald-400/80">SYSTEM ONLINE</span>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all duration-200 uppercase tracking-wider"
            >
              <LogOut className="h-4 w-4" />
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}