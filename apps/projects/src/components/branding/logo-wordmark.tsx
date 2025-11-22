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
            <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>
          </defs>
          <circle cx="12" cy="12" r="2.8" fill="#e84f96" filter="url(#glow-pink)" opacity="0.6" />
          <circle cx="12" cy="12" r="3.2" fill="#e84f96" />
          <path d="M12 2C8.1 2 5 5.1 5 9C5 11.4 6.2 13.5 8 14.7V17C8 17.6 8.4 18 9 18H15C15.6 18 16 17.6 16 17V14.7C17.8 13.5 19 11.4 19 9C19 5.1 15.9 2 12 2ZM12 13C11.2 13 10.5 12.3 10.5 11.5C10.5 10.7 11.2 10 12 10C12.8 10 13.5 10.7 13.5 11.5C13.5 12.3 12.8 13 12 13ZM14 20H10V22H14V20Z" fill="#ffffff" opacity="0.85"/>
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
