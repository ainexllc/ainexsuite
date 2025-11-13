'use client';

import Link from 'next/link';
import { clsx } from 'clsx';

interface AinexStudiosLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center';
  asLink?: boolean;
}

const sizeConfig = {
  sm: {
    ainex: 'text-3xl',
    studios: 'text-xs',
    letterSpacing: '0.42em',
    gap: 'gap-1',
  },
  md: {
    ainex: 'text-4xl',
    studios: 'text-sm',
    letterSpacing: '0.46em',
    gap: 'gap-1',
  },
  lg: {
    ainex: 'text-5xl sm:text-6xl',
    studios: 'text-base sm:text-lg',
    letterSpacing: '0.52em',
    gap: 'gap-1.5',
  },
  xl: {
    ainex: 'text-6xl sm:text-7xl md:text-8xl',
    studios: 'text-lg sm:text-xl md:text-2xl',
    letterSpacing: '0.58em',
    gap: 'gap-2',
  },
} as const;

export function AinexStudiosLogo({
  className = '',
  size = 'lg',
  align = 'center',
  asLink = true,
}: AinexStudiosLogoProps) {
  const config = sizeConfig[size];

  const content = (
    <>
      <div
        className={clsx('font-brand font-black tracking-tight text-white', config.ainex)}
        style={{ letterSpacing: '-0.015em' }}
      >
        <span className="text-[#f97316]">A</span>
        <span className="text-[#f97316]">I</span>
        <span>N</span>
        <span>E</span>
        <span>X</span>
      </div>
      <div
        className={clsx('font-brand font-semibold uppercase text-purple-500', config.studios)}
        style={{
          letterSpacing: config.letterSpacing,
          marginLeft: align === 'start' ? '-0.3em' : '0'
        }}
      >
        WORKFLOW
      </div>
    </>
  );

  const containerClassName = clsx(
    'flex flex-col justify-center leading-none',
    config.gap,
    align === 'start' ? 'items-start text-left' : 'items-center text-center',
    asLink && 'transition-opacity hover:opacity-80',
    className
  );

  if (asLink) {
    return (
      <Link href="/" className={containerClassName} style={{ transform: 'scale(1.15)' }}>
        {content}
      </Link>
    );
  }

  return (
    <div className={containerClassName} style={{ transform: 'scale(1.15)' }}>
      {content}
    </div>
  );
}
