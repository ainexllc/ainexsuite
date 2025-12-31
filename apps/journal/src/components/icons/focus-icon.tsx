import { forwardRef } from "react";

interface FocusIconProps extends React.SVGProps<SVGSVGElement> {
  focused?: boolean;
}

export const FocusIcon = forwardRef<SVGSVGElement, FocusIconProps>(
  ({ focused = false, className = "w-4 h-4", ...props }, ref) => {
    if (focused) {
      // Filled eye - focused state
      return (
        <svg
          ref={ref}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          {...props}
        >
          <path d="M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19S21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 16.5C9.24 16.5 7 14.26 7 11.5S9.24 6.5 12 6.5 17 8.74 17 11.5 14.76 16.5 12 16.5ZM12 8.5C10.34 8.5 9 9.84 9 11.5S10.34 14.5 12 14.5 15 13.16 15 11.5 13.66 8.5 12 8.5Z" />
        </svg>
      );
    }

    // Outline eye - unfocused state
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <path d="M1 12S5 4 12 4 23 12 23 12 19 20 12 20 1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
);

FocusIcon.displayName = "FocusIcon";

// LucideIcon-compatible wrapper for navigation
export const FocusIconNav = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className = "w-4 h-4", ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M1 12S5 4 12 4 23 12 23 12 19 20 12 20 1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
);

FocusIconNav.displayName = "FocusIconNav";
