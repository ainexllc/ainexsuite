"use client";

import Link from "next/link";
import type { Route } from "next";
import { clsx } from "clsx";

type LogoWordmarkProps = {
  href?: string;
  className?: string;
  iconSize?: number;
  variant?: "light" | "dark";
};

export function LogoWordmark({
  href,
  className,
  iconSize = 87.2,
  variant = "dark",
}: LogoWordmarkProps) {
  const isLight = variant === "light";
  const fontSize = iconSize * 0.52;
  const letterSpacing = iconSize * -0.018;
  const xOffset = iconSize * 0.28;
  const yOffset = iconSize * 0.09;

  const content = (
    <div
      className={clsx(
        "flex items-center font-[family-name:var(--font-kanit)] font-semibold",
        className,
      )}
      style={{ fontSize: `${fontSize}px`, letterSpacing: `${letterSpacing}px` }}
    >
      <span className="text-orange-500">AI</span>
      <span
        className={clsx(isLight ? "text-ink-900" : "text-white")}
        style={{ paddingRight: "1px" }}
      >
        Ne
      </span>
      <span
        className="relative inline-block"
        style={{
          width: iconSize,
          height: iconSize,
          marginLeft: `-${xOffset}px`,
          transform: `translateY(${yOffset}px)`,
        }}
      >
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <defs>
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>
          </defs>
          <circle cx="12" cy="12" r="2.8" fill="#36b2d3" filter="url(#glow-cyan)" opacity="0.6" />
          <circle cx="12" cy="12" r="3.2" fill="#36b2d3" />
          <circle cx="12" cy="3" r="1.6" fill="#ffffff" opacity="0.9"/>
          <path d="M12 4.8 V7.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
          <circle cx="21" cy="12" r="1.6" fill="#ffffff" opacity="0.8"/>
          <path d="M19.5 12 H16.8" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
          <circle cx="12" cy="21" r="1.6" fill="#ffffff" opacity="0.8"/>
          <path d="M12 19.2 V16.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
          <circle cx="3" cy="12" r="1.6" fill="#ffffff" opacity="0.7"/>
          <path d="M4.5 12 H7.2" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
          <path d="M13.5 4.5 L19 10" stroke="#ffffff" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>
          <path d="M13.5 19.5 L19 14" stroke="#ffffff" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.5"/>
        </svg>
      </span>
      <span
        className="text-blue-500 font-[family-name:var(--font-kanit)] font-semibold"
        style={{ marginLeft: "-8px", transform: "translateY(2px)" }}
      >
        Suite
      </span>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href as Route} className="inline-flex items-center">
      {content}
    </Link>
  );
}
