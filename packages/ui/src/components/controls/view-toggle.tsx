"use client";

import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export type ViewToggleSize = "sm" | "md" | "lg";
export type ViewToggleVariant = "default" | "pills" | "tabs";

export interface ViewToggleOption<T extends string = string> {
  value: T;
  icon?: LucideIcon;
  label?: string;
  ariaLabel?: string;
}

export interface ViewToggleProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewToggleOption<T>[];
  size?: ViewToggleSize;
  variant?: ViewToggleVariant;
  className?: string;
  "aria-label"?: string;
}

// ============================================================================
// ViewToggle Component
// ============================================================================

export function ViewToggle<T extends string = string>({
  value,
  onChange,
  options,
  size = "md",
  variant = "default",
  className,
  "aria-label": ariaLabel = "View toggle",
}: ViewToggleProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState<number>(
    options.findIndex((opt) => opt.value === value)
  );
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update indicator position when value changes
  useEffect(() => {
    const selectedIndex = options.findIndex((opt) => opt.value === value);
    const button = buttonRefs.current[selectedIndex];
    if (button && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [value, options]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = options.length - 1;
    } else {
      return;
    }

    setFocusedIndex(newIndex);
    buttonRefs.current[newIndex]?.focus();
    onChange(options[newIndex].value);
  };

  // Size classes
  const sizeClasses = {
    sm: {
      container: "p-0.5",
      button: "h-7 px-2 text-xs",
      iconOnly: "h-7 w-7",
      icon: "h-3.5 w-3.5",
      gap: "gap-1",
    },
    md: {
      container: "p-1",
      button: "h-8 px-3 text-sm",
      iconOnly: "h-8 w-8",
      icon: "h-4 w-4",
      gap: "gap-1.5",
    },
    lg: {
      container: "p-1",
      button: "h-10 px-4 text-base",
      iconOnly: "h-10 w-10",
      icon: "h-5 w-5",
      gap: "gap-2",
    },
  };

  // Variant classes
  const variantClasses = {
    default:
      "bg-black/40 backdrop-blur-sm border border-white/10 shadow-sm rounded-full",
    pills: "bg-surface-card border border-surface-hover rounded-lg",
    tabs: "bg-transparent border-b border-surface-hover",
  };

  const getButtonClasses = (isSelected: boolean, hasLabel: boolean) => {
    const baseClasses =
      "inline-flex items-center justify-center transition-all font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white/20 relative z-10";

    const variantButtonClasses = {
      default: clsx(
        "rounded-full",
        isSelected
          ? "text-white"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      ),
      pills: clsx(
        "rounded",
        isSelected
          ? "text-accent-500"
          : "text-ink-600 hover:text-ink-800 hover:bg-surface-hover"
      ),
      tabs: clsx(
        "rounded-t border-b-2",
        isSelected
          ? "text-accent-500 border-accent-500"
          : "text-ink-600 hover:text-ink-800 border-transparent"
      ),
    };

    return clsx(
      baseClasses,
      variantButtonClasses[variant],
      hasLabel ? sizeClasses[size].button : sizeClasses[size].iconOnly,
      sizeClasses[size].gap
    );
  };

  const getIndicatorClasses = () => {
    const baseClasses = "absolute transition-all duration-200 ease-out z-0";

    const variantIndicatorClasses = {
      default: "bg-[var(--color-primary)] rounded-full shadow-md",
      pills: "bg-accent-500/10 rounded",
      tabs: "bg-transparent",
    };

    return clsx(baseClasses, variantIndicatorClasses[variant]);
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex items-center relative",
        variantClasses[variant],
        sizeClasses[size].container,
        sizeClasses[size].gap,
        className
      )}
    >
      {/* Animated indicator */}
      {variant !== "tabs" && (
        <div
          className={getIndicatorClasses()}
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            height:
              variant === "default"
                ? sizeClasses[size].iconOnly.split(" ")[0].replace("h-", "")
                : sizeClasses[size].button.split(" ")[0].replace("h-", ""),
          }}
        />
      )}

      {/* Options */}
      {options.map((option, index) => {
        const Icon = option.icon;
        const isSelected = option.value === value;
        const hasLabel = Boolean(option.label);

        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.ariaLabel || option.label}
            title={option.label || option.ariaLabel}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={getButtonClasses(isSelected, hasLabel)}
          >
            {Icon && <Icon className={sizeClasses[size].icon} />}
            {option.label && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// SegmentedControl Component (Generic Alternative)
// ============================================================================

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  fullWidth?: boolean;
  size?: ViewToggleSize;
  className?: string;
  "aria-label"?: string;
}

export function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  fullWidth = false,
  size = "md",
  className,
  "aria-label": ariaLabel = "Segmented control",
}: SegmentedControlProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState<number>(
    options.findIndex((opt) => opt.value === value)
  );
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update indicator position when value changes
  useEffect(() => {
    const selectedIndex = options.findIndex((opt) => opt.value === value);
    const button = buttonRefs.current[selectedIndex];
    if (button && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [value, options]);

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    currentIndex: number,
    disabled?: boolean
  ) => {
    if (disabled) return;

    let newIndex = currentIndex;

    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      do {
        newIndex = newIndex > 0 ? newIndex - 1 : options.length - 1;
      } while (options[newIndex].disabled && newIndex !== currentIndex);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      do {
        newIndex = newIndex < options.length - 1 ? newIndex + 1 : 0;
      } while (options[newIndex].disabled && newIndex !== currentIndex);
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
      while (options[newIndex].disabled && newIndex < options.length - 1) {
        newIndex++;
      }
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = options.length - 1;
      while (options[newIndex].disabled && newIndex > 0) {
        newIndex--;
      }
    } else {
      return;
    }

    if (newIndex !== currentIndex) {
      setFocusedIndex(newIndex);
      buttonRefs.current[newIndex]?.focus();
      onChange(options[newIndex].value);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: {
      container: "p-0.5",
      button: "h-7 px-3 text-xs",
      icon: "h-3.5 w-3.5",
      gap: "gap-1.5",
    },
    md: {
      container: "p-1",
      button: "h-9 px-4 text-sm",
      icon: "h-4 w-4",
      gap: "gap-2",
    },
    lg: {
      container: "p-1",
      button: "h-11 px-5 text-base",
      icon: "h-5 w-5",
      gap: "gap-2",
    },
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex items-center relative bg-surface-card border border-surface-hover rounded-lg",
        sizeClasses[size].container,
        sizeClasses[size].gap,
        fullWidth && "w-full",
        className
      )}
    >
      {/* Animated indicator */}
      <div
        className="absolute bg-accent-500/10 rounded transition-all duration-200 ease-out z-0"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          height: sizeClasses[size].button.split(" ")[0].replace("h-", ""),
        }}
      />

      {/* Options */}
      {options.map((option, index) => {
        const Icon = option.icon;
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            disabled={option.disabled}
            onClick={() => !option.disabled && onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index, option.disabled)}
            className={clsx(
              "inline-flex items-center justify-center rounded transition-all font-medium relative z-10",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-accent-500/50",
              sizeClasses[size].button,
              sizeClasses[size].gap,
              fullWidth && "flex-1",
              option.disabled
                ? "opacity-50 cursor-not-allowed"
                : isSelected
                  ? "text-accent-500"
                  : "text-ink-600 hover:text-ink-800 hover:bg-surface-hover"
            )}
          >
            {Icon && <Icon className={sizeClasses[size].icon} />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
