'use client';

import Link from 'next/link';
import { clsx } from 'clsx';

export interface LogoWordmarkProps {
  iconSize?: number;
  asLink?: boolean;
  className?: string;
}

export function LogoWordmark({
  iconSize = 44,
  asLink = false,
  className = '',
}: LogoWordmarkProps) {
  const content = (
    <div
      className={clsx('flex items-center', className)}
    >
      <div
        className="font-brand font-black tracking-tight text-foreground leading-none"
        style={{
          fontSize: `${iconSize}px`,
          letterSpacing: '-0.015em'
        }}
      >
        <span className="text-[#f97316]">A</span>
        <span className="text-[#f97316]">I</span>
        <span>N</span>
        <span>E</span>
        <span>X</span>
      </div>
    </div>
  );

  if (asLink) {
    return <Link href="/">{content}</Link>;
  }

  return content;
}
