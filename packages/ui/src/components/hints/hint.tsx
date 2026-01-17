"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X, Lightbulb, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useHints, type HintConfig, type HintPlacement } from "./hints-provider";

export interface HintProps<T extends string = string> {
  /** The hint configuration */
  hint: HintConfig<T>;
  /** The target element to attach the hint to */
  children: ReactNode;
  /** Additional condition to show the hint */
  showWhen?: boolean;
  /** Custom class name for the wrapper */
  className?: string;
  /** Custom icon for the hint */
  icon?: LucideIcon;
  /** Delay before showing the hint (ms) */
  showDelay?: number;
  /** Custom color scheme */
  colorScheme?: "amber" | "blue" | "green" | "purple" | "pink";
}

const placementStyles: Record<HintPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles: Record<HintPlacement, string> = {
  top: "top-full left-1/2 -translate-x-1/2",
  bottom: "bottom-full left-1/2 -translate-x-1/2",
  left: "left-full top-1/2 -translate-y-1/2",
  right: "right-full top-1/2 -translate-y-1/2",
};

const colorSchemes = {
  amber: {
    gradient: "from-amber-500 to-amber-600",
    border: "border-amber-400/30",
    arrowColor: "border-amber-500",
    buttonBg: "bg-white/20 hover:bg-white/30",
    iconBg: "bg-white/20",
  },
  blue: {
    gradient: "from-blue-500 to-blue-600",
    border: "border-blue-400/30",
    arrowColor: "border-blue-500",
    buttonBg: "bg-white/20 hover:bg-white/30",
    iconBg: "bg-white/20",
  },
  green: {
    gradient: "from-emerald-500 to-emerald-600",
    border: "border-emerald-400/30",
    arrowColor: "border-emerald-500",
    buttonBg: "bg-white/20 hover:bg-white/30",
    iconBg: "bg-white/20",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    border: "border-purple-400/30",
    arrowColor: "border-purple-500",
    buttonBg: "bg-white/20 hover:bg-white/30",
    iconBg: "bg-white/20",
  },
  pink: {
    gradient: "from-pink-500 to-pink-600",
    border: "border-pink-400/30",
    arrowColor: "border-pink-500",
    buttonBg: "bg-white/20 hover:bg-white/30",
    iconBg: "bg-white/20",
  },
};

const getArrowBorderClass = (
  placement: HintPlacement,
  _arrowColor: string
): string => {
  const baseArrow = arrowStyles[placement];
  const borderDirection =
    placement === "top"
      ? `border-t-current border-x-transparent border-b-transparent`
      : placement === "bottom"
        ? `border-b-current border-x-transparent border-t-transparent`
        : placement === "left"
          ? `border-l-current border-y-transparent border-r-transparent`
          : `border-r-current border-y-transparent border-l-transparent`;

  return `${baseArrow} ${borderDirection}`;
};

/**
 * Hint - Tooltip component for first-time user guidance
 *
 * Wraps an element and displays a hint tooltip that can be dismissed.
 * Dismissed hints are persisted via the HintsProvider.
 *
 * @example
 * ```tsx
 * <Hint
 *   hint={{
 *     id: 'first-note',
 *     title: 'Create your first note',
 *     description: 'Tap here to capture your thoughts.',
 *     placement: 'bottom',
 *   }}
 *   showWhen={notes.length === 0}
 * >
 *   <Button>New Note</Button>
 * </Hint>
 * ```
 */
export function Hint<T extends string = string>({
  hint,
  children,
  showWhen = true,
  className,
  icon: Icon = Lightbulb,
  showDelay = 500,
  colorScheme = "amber",
}: HintProps<T>) {
  const { shouldShowHint, dismissHint } = useHints<T>();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const shouldShow = showWhen && shouldShowHint(hint.id);
  const colors = colorSchemes[colorScheme];

  // Delay showing to allow page to settle
  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, showDelay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [shouldShow, showDelay]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      dismissHint(hint.id);
    }, 200);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {children}

      {isVisible && (
        <div
          className={cn(
            "absolute z-50 w-64 p-3 rounded-xl shadow-xl",
            `bg-gradient-to-br ${colors.gradient}`,
            colors.border,
            "border",
            "transition-all duration-200",
            isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95",
            placementStyles[hint.placement]
          )}
        >
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-0 h-0 border-[6px]",
              getArrowBorderClass(hint.placement, colors.arrowColor)
            )}
            style={{
              color:
                colorScheme === "amber"
                  ? "#f59e0b"
                  : colorScheme === "blue"
                    ? "#3b82f6"
                    : colorScheme === "green"
                      ? "#10b981"
                      : colorScheme === "purple"
                        ? "#8b5cf6"
                        : "#ec4899",
            }}
          />

          {/* Content */}
          <div className="flex items-start gap-2">
            <div className={cn("flex-shrink-0 p-1.5 rounded-lg", colors.iconBg)}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-0.5">
                {hint.title}
              </h4>
              <p className="text-xs text-white/90 leading-relaxed">
                {hint.description}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Dismiss hint"
            >
              <X className="h-4 w-4 text-white/80" />
            </button>
          </div>

          {/* Got it button */}
          <button
            onClick={handleDismiss}
            className={cn(
              "w-full mt-2.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors",
              colors.buttonBg
            )}
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  );
}

export default Hint;
