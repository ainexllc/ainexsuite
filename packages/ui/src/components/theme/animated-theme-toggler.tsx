"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Animation duration in ms (default: 400) */
  duration?: number;
}

/**
 * Animated theme toggler with View Transitions API
 *
 * Cycles through: light → dark → system
 * Creates a smooth circular reveal animation when toggling themes.
 * Falls back to instant toggle on browsers without View Transitions support.
 *
 * @example
 * ```tsx
 * <AnimatedThemeToggler className="h-9 w-9 rounded-full" />
 * ```
 */
export function AnimatedThemeToggler({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(async () => {
    // Cycle: light → dark → system → light
    let newTheme: string;
    if (theme === "light") {
      newTheme = "dark";
    } else if (theme === "dark") {
      newTheme = "system";
    } else {
      newTheme = "light";
    }

    // Check for View Transitions API support
    if (!document.startViewTransition || !buttonRef.current) {
      setTheme(newTheme);
      return;
    }

    // Use View Transitions for smooth animation
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    try {
      await transition.ready;

      const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } catch {
      // Animation failed, but theme is already changed
    }
  }, [theme, setTheme, duration]);

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          "text-zinc-500 hover:bg-zinc-300/80 hover:text-zinc-700",
          "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
          className
        )}
        aria-label="Toggle theme"
        disabled
        {...props}
      >
        <div className="h-4 w-4" />
      </button>
    );
  }

  // Determine icon and label based on current theme setting
  const getThemeInfo = () => {
    if (theme === "system") {
      return {
        icon: Monitor,
        label: "System theme",
        nextLabel: "Switch to light mode",
      };
    } else if (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) {
      return {
        icon: Moon,
        label: "Dark mode",
        nextLabel: "Switch to system theme",
      };
    } else {
      return {
        icon: Sun,
        label: "Light mode",
        nextLabel: "Switch to dark mode",
      };
    }
  };

  const { icon: Icon, label, nextLabel } = getThemeInfo();

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        "text-zinc-500 hover:bg-zinc-300/80 hover:text-zinc-700",
        "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
        className
      )}
      aria-label={nextLabel}
      title={label}
      {...props}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
