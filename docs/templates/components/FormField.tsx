/**
 * FormField Component Template
 *
 * Accessible form field wrapper with label, error, and hint text support.
 *
 * Features:
 * - Associated label for screen readers
 * - Inline error messages with icon
 * - Optional hint text
 * - Required field indicator
 * - Automatic ID generation for accessibility
 *
 * Usage:
 *   <FormField
 *     label="Email"
 *     error={errors.email}
 *     touched={touched.email}
 *     required
 *     hint="We'll never share your email"
 *   >
 *     <input
 *       type="email"
 *       value={email}
 *       onChange={(e) => setEmail(e.target.value)}
 *     />
 *   </FormField>
 */

import { ReactNode, useId, cloneElement } from "react";
import { AlertCircle } from "lucide-react";
import { clsx } from "clsx";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  touched?: boolean;
  required?: boolean;
  hint?: string;
  className?: string;
}

export function FormField({
  label,
  children,
  error,
  touched = false,
  required = false,
  hint,
  className,
}: FormFieldProps) {
  const id = useId();
  const showError = error && touched;

  return (
    <div className={clsx("space-y-2", className)}>
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-sm font-medium text-ink-base dark:text-ink-200"
      >
        {label}
        {required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
      </label>

      {/* Input (inject id into children) */}
      <div>
        {typeof children === "object" &&
        children !== null &&
        "type" in children
          ? // Clone React element and add id
            cloneElement(children as React.ReactElement, {
              id,
              "aria-invalid": showError,
              "aria-describedby": showError ? `${id}-error` : hint ? `${id}-hint` : undefined,
            })
          : children}
      </div>

      {/* Hint text (only show when no error) */}
      {hint && !showError && (
        <p id={`${id}-hint`} className="text-xs text-ink-muted dark:text-ink-400">
          {hint}
        </p>
      )}

      {/* Error message */}
      {showError && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// Common input styles export
export const inputStyles = clsx(
  "w-full rounded-xl border border-outline-subtle bg-white px-4 py-2 text-ink-base transition",
  "placeholder:text-ink-muted",
  "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:border-outline-subtle dark:bg-surface-elevated dark:text-ink-200",
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-200"
);
