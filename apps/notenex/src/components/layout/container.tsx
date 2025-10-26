"use client";

import { clsx } from "clsx";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ContainerVariant = "default" | "wide" | "narrow" | "full";
type ContainerPadding = "default" | "none";

const variantClassMap: Record<ContainerVariant, string> = {
  default:
    "max-w-[min(100%,var(--app-shell-max-width-sm))] md:max-w-[min(100%,var(--app-shell-max-width-md))] xl:max-w-[min(100%,var(--app-shell-max-width-lg))] 2xl:max-w-[min(100%,var(--app-shell-max-width-xl))]",
  wide:
    "max-w-[min(100%,var(--app-shell-wide-max-width-sm))] md:max-w-[min(100%,var(--app-shell-wide-max-width-md))] xl:max-w-[min(100%,var(--app-shell-wide-max-width-lg))] 2xl:max-w-[min(100%,var(--app-shell-wide-max-width-xl))]",
  narrow:
    "max-w-[min(100%,var(--note-board-max-width-sm))] md:max-w-[min(100%,var(--note-board-max-width-md))] xl:max-w-[min(100%,var(--note-board-max-width-lg))] 2xl:max-w-[min(100%,var(--note-board-max-width-xl))]",
  full: "max-w-none",
};

const paddingClassMap: Record<ContainerPadding, string> = {
  default: "px-4 sm:px-6 lg:px-8",
  none: "",
};

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  variant?: ContainerVariant;
  padding?: ContainerPadding;
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { children, className, variant = "default", padding = "default", ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "mx-auto w-full",
        paddingClassMap[padding],
        variantClassMap[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
