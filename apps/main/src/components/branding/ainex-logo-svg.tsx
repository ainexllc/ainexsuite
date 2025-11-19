'use client';

import Link from 'next/link';
import { clsx } from 'clsx';

interface AinexLogoSVGProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asLink?: boolean;
}

const sizeConfig = {
  sm: { width: 120, height: 60 },
  md: { width: 160, height: 80 },
  lg: { width: 240, height: 120 },
  xl: { width: 320, height: 160 },
} as const;

export function AinexLogoSVG({
  className = '',
  size = 'lg',
  asLink = true,
}: AinexLogoSVGProps) {
  const config = sizeConfig[size];

  const svg = (
    <svg
      width={config.width}
      height={config.height}
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('transition-opacity', asLink && 'hover:opacity-80', className)}
    >
      {/* AINEX Text */}
      <g id="ainex">
        {/* A - Orange */}
        <path
          d="M20 75 L35 40 L50 75 M28 63 L42 63"
          stroke="#f97316"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* I - Orange */}
        <path
          d="M65 40 L65 75"
          stroke="#f97316"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* N - White */}
        <path
          d="M85 75 L85 40 L110 75 L110 40"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* E - White */}
        <path
          d="M130 40 L155 40 M130 40 L130 75 M130 57.5 L150 57.5 M130 75 L155 75"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* X - White */}
        <path
          d="M170 40 L195 75 M195 40 L170 75"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* SUITE Text */}
      <g id="suite">
        <text
          x="120"
          y="100"
          fill="#3b82f6"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fontWeight="600"
          letterSpacing="7.2"
          textAnchor="middle"
        >
          SUITE
        </text>
      </g>
    </svg>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-block">
        {svg}
      </Link>
    );
  }

  return <div className="inline-block">{svg}</div>;
}
