"use client";

import * as React from "react";
import { clsx } from "clsx";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { GlassModal, GlassModalContent, GlassModalFooter } from "../glass-modal";

/**
 * Alert type variants
 */
export type AlertType = "info" | "warning" | "success" | "error";

/**
 * AlertModal Props
 */
export interface AlertModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is dismissed */
  onDismiss: () => void;
  /** Alert title */
  title: string;
  /** Alert message (can be string or React node for custom content) */
  message: string | React.ReactNode;
  /** Alert type - determines icon and color */
  type?: AlertType;
  /** Text for the dismiss button */
  dismissLabel?: string;
  /** Custom icon to override default type icon */
  icon?: React.ComponentType<{ className?: string }>;
  /** Modal size */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

/**
 * Alert type configurations
 */
const alertConfig = {
  info: {
    icon: Info,
    iconColor: "text-blue-500 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    buttonColor: "#3b82f6", // blue-500
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    buttonColor: "#f59e0b", // amber-500
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-500 dark:text-green-400",
    iconBg: "bg-green-500/10 dark:bg-green-500/20",
    buttonColor: "#22c55e", // green-500
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-500 dark:text-red-400",
    iconBg: "bg-red-500/10 dark:bg-red-500/20",
    buttonColor: "#ef4444", // red-500
  },
};

/**
 * AlertModal - A modal component for informational alerts
 *
 * Features:
 * - Icon support for different alert types (info, warning, success, error)
 * - Single dismiss button
 * - Glassmorphism styling
 * - Type-based color theming
 *
 * @example
 * ```tsx
 * <AlertModal
 *   isOpen={isOpen}
 *   onDismiss={handleDismiss}
 *   type="success"
 *   title="Entry Created"
 *   message="Your journal entry has been saved successfully."
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom icon and message
 * <AlertModal
 *   isOpen={isOpen}
 *   onDismiss={handleDismiss}
 *   type="error"
 *   title="Connection Failed"
 *   message={
 *     <div>
 *       <p>Unable to connect to the server.</p>
 *       <p className="text-sm mt-2">Please check your internet connection.</p>
 *     </div>
 *   }
 *   icon={WifiOff}
 * />
 * ```
 */
export function AlertModal({
  isOpen,
  onDismiss,
  title,
  message,
  type = "info",
  dismissLabel = "OK",
  icon,
  size = "sm",
  className,
}: AlertModalProps) {
  const config = alertConfig[type];
  const Icon = icon || config.icon;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onDismiss}
      size={size}
      variant="frosted"
      className={className}
    >
      <GlassModalContent className="py-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Icon */}
          <div
            className={clsx(
              "flex items-center justify-center w-12 h-12 rounded-full",
              config.iconBg
            )}
          >
            <Icon className={clsx("w-6 h-6", config.iconColor)} />
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {title}
            </h2>
            <div className="text-sm text-muted-foreground">
              {typeof message === "string" ? <p>{message}</p> : message}
            </div>
          </div>
        </div>
      </GlassModalContent>

      {/* Footer with Dismiss Button */}
      <GlassModalFooter className="justify-center">
        <button
          type="button"
          onClick={onDismiss}
          className="px-6 py-2 text-sm font-medium text-foreground rounded-lg transition-colors shadow-lg min-w-[100px]"
          style={{
            backgroundColor: config.buttonColor,
            boxShadow: `0 4px 14px -2px ${config.buttonColor}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          {dismissLabel}
        </button>
      </GlassModalFooter>
    </GlassModal>
  );
}
