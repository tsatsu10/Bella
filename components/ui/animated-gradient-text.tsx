"use client";

import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<"span"> {
  speed?: number;
  colorFrom?: string;
  colorTo?: string;
  /** When true, gradient is static (no animation). Use for prefers-reduced-motion. */
  reduceMotion?: boolean;
}

export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = "#d4af37",
  colorTo = "#e8c547",
  reduceMotion = false,
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      style={
        {
          "--bg-size": `${speed * 300}%`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
        } as React.CSSProperties
      }
      className={cn(
        "inline bg-gradient-to-r from-[var(--color-from)] via-[var(--color-to)] to-[var(--color-from)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
        !reduceMotion && "animate-gradient",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
