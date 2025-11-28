"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../../lib/utils";

export function ThemeSwitcher({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-1 rounded-lg bg-muted p-1", className)}>
        <div className="h-8 w-8 rounded-md" />
        <div className="h-8 w-8 rounded-md" />
        <div className="h-8 w-8 rounded-md" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-muted p-1", className)}>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "rounded-md p-2 transition-colors",
          theme === "light"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded-md p-2 transition-colors",
          theme === "dark"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "rounded-md p-2 transition-colors",
          theme === "system"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
