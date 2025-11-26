'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  LayoutGrid,
  Sparkles,
  X,
  Cpu,
  Zap,
  Paintbrush
} from 'lucide-react';
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
  { label: 'Theme', href: '/theme', icon: Paintbrush },
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
      <div className="md:hidden flex items-center justify-between p-4 border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl fixed top-0 inset-x-0 z-50">
        <div className="flex items-center gap-3 text-white">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Cpu className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="tracking-widest font-orbitron text-sm font-bold">AINEX</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-cyan-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={clsx(
        "fixed top-4 bottom-4 left-4 z-50 w-64 transition-transform duration-300 ease-out md:translate-x-0 md:static",
        "bg-[#0c0c14]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/5 overflow-hidden flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-[150%] md:translate-x-0 md:h-[calc(100vh-2rem)] md:my-4 md:ml-4 md:mr-0"
      )}>
        {/* Cyberpunk Top Border */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />

        <div className="h-full flex flex-col relative">
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-30" />

          {/* Header */}
          <div className="p-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Cpu className="h-6 w-6 text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              </div>
              <div>
                <h1 className="font-orbitron font-black text-white text-xl tracking-wider leading-none">
                  AINEX
                </h1>
                <p className="text-[10px] font-mono text-cyan-400/70 tracking-[0.3em] uppercase mt-0.5">
                  CONTROL v2.1
                </p>
              </div>
            </div>
          </div>

          {/* System Status Bar */}
          <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider">System Online</span>
            </div>
            <Zap className="h-3 w-3 text-emerald-400" />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 relative z-10">
            <p className="px-3 text-[10px] font-orbitron font-bold text-cyan-500/50 uppercase tracking-[0.2em] mb-3">
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
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {/* Active Background */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-transparent border-l-2 border-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]" />
                  )}

                  {/* Hover Glow */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  )}

                  <item.icon className={clsx(
                    "h-5 w-5 relative z-10 transition-all duration-300",
                    isActive
                      ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      : "group-hover:text-cyan-300"
                  )} />
                  <span className="relative z-10 font-jetbrains tracking-wide">{item.label}</span>

                  {isActive && (
                    <div className="absolute right-3 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)] animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 mt-auto relative z-10 border-t border-white/5">
            {/* Terminal-style status */}
            <div className="p-3 rounded-lg bg-black/50 border border-white/5 mb-3 font-mono text-[10px]">
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="text-cyan-500">&gt;</span>
                <span>uptime: <span className="text-emerald-400">99.9%</span></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 mt-1">
                <span className="text-cyan-500">&gt;</span>
                <span>latency: <span className="text-cyan-400">12ms</span></span>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-200 uppercase tracking-wider font-mono group"
            >
              <LogOut className="h-4 w-4 group-hover:animate-pulse" />
              Disconnect
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
