"use client";

import Link from "next/link";
import type { Route } from "next";
import { clsx } from "clsx";
import { useTheme } from "@/components/providers/theme-provider";

type LogoWordmarkProps = {
  href?: string;
  className?: string;
  iconSize?: number;
  variant?: "light" | "dark";
};

export function LogoWordmark({
  href,
  className,
  iconSize = 64,
  variant,
}: LogoWordmarkProps) {
  const { theme } = useTheme();
  const isLight = variant ? variant === "light" : theme === "light";
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
      <span className="text-orange-500">Note</span>
      <span className={clsx(isLight ? "text-ink-900" : "text-white")} style={{ paddingRight: '1px' }}>Ne</span>
      <span
        className="relative inline-block"
        style={{
          width: iconSize,
          height: iconSize,
          marginLeft: `-${xOffset}px`,
          transform: `translateY(${yOffset}px)`,
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <rect x="10" y="10" width="15" height="15" fill="#f97316" />
          <rect x="30" y="30" width="15" height="15" fill="#f97316" />
          <rect x="50" y="50" width="15" height="15" fill="#f97316" />
          <rect x="70" y="70" width="15" height="15" fill="#f97316" />
          <rect
            x="70"
            y="10"
            width="15"
            height="15"
            fill={isLight ? "#111827" : "#ffffff"}
          />
          <rect
            x="50"
            y="30"
            width="15"
            height="15"
            fill={isLight ? "#111827" : "#ffffff"}
          />
          <rect
            x="30"
            y="50"
            width="15"
            height="15"
            fill={isLight ? "#111827" : "#ffffff"}
          />
          <rect
            x="10"
            y="70"
            width="15"
            height="15"
            fill={isLight ? "#111827" : "#ffffff"}
          />
        </svg>
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
