/**
 * Card Component Template
 *
 * Flexible card container with optional header, footer, and hover states.
 *
 * Features:
 * - Clean bordered design matching AiNex aesthetics
 * - Optional hover effect
 * - Optional header and footer sections
 * - Padding variants
 * - Interactive mode for clickable cards
 *
 * Usage:
 *   <Card>
 *     <Card.Header>
 *       <h3>Card Title</h3>
 *     </Card.Header>
 *     <Card.Content>
 *       Card body content goes here
 *     </Card.Content>
 *     <Card.Footer>
 *       Footer actions
 *     </Card.Footer>
 *   </Card>
 */

import { ReactNode, HTMLAttributes } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export function Card({
  children,
  hover = false,
  interactive = false,
  padding = "md",
  className,
  ...props
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={clsx(
        "rounded-2xl border border-outline-subtle bg-white dark:bg-surface-elevated",
        paddingStyles[padding],
        hover && "transition hover:shadow-md",
        interactive && "cursor-pointer transition hover:border-outline-strong",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Sub-components
Card.Header = function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mb-4 border-b border-outline-subtle pb-4", className)}>
      {children}
    </div>
  );
};

Card.Content = function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={clsx(className)}>{children}</div>;
};

Card.Footer = function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mt-4 border-t border-outline-subtle pt-4", className)}>
      {children}
    </div>
  );
};
