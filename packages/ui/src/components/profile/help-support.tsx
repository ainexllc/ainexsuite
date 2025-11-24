'use client';

import { HelpCircle, MessageCircle, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface HelpSupportProps {
  onClose?: () => void;
}

export function HelpSupport({ onClose }: HelpSupportProps) {
  const links = [
    {
      label: 'Help Center',
      href: '/help',
      icon: HelpCircle,
      description: 'Browse articles & guides',
    },
    {
      label: 'Contact Support',
      href: '/support',
      icon: MessageCircle,
      description: 'Get help from our team',
    },
    {
      label: 'Documentation',
      href: '/docs',
      icon: BookOpen,
      description: 'Technical docs & API reference',
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider px-1">
        Help & Support
      </h3>

      <div className="space-y-1">
        {links.map((link) => {
          const IconComponent = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 flex-shrink-0">
                <IconComponent className="h-4 w-4 text-white/60" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-white/90 transition">
                  {link.label}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {link.description}
                </p>
              </div>

              <ExternalLink className="h-3.5 w-3.5 text-white/30 group-hover:text-white/50 transition flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
