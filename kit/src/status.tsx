import React from "react";
import { cn } from "./cn.js";

/** Semantic colour of a status. */
export type Tone = "success" | "warning" | "error" | "info" | "neutral" | "accent";

// Token pairs, all present in theme.css: Success/SuccessLight, Warning/WarningLight, Error/ErrorLight,
// PrimaryBlue/MediumBlue, SecondaryText/LightGrey, PrimaryText/MediumPurple. Accent text is PrimaryText, not
// PrimaryPurple: PrimaryPurple on MediumPurple is 2.05:1 in dark; the dot keeps the purple.
const TONE: Record<Tone, string> = {
  success: "text-klerosUIComponentsSuccess bg-klerosUIComponentsSuccessLight",
  warning: "text-klerosUIComponentsWarning bg-klerosUIComponentsWarningLight",
  error: "text-klerosUIComponentsError bg-klerosUIComponentsErrorLight",
  info: "text-klerosUIComponentsPrimaryBlue bg-klerosUIComponentsMediumBlue",
  neutral: "text-klerosUIComponentsSecondaryText bg-klerosUIComponentsLightGrey",
  accent: "text-klerosUIComponentsPrimaryText bg-klerosUIComponentsMediumPurple",
};

// Dot colour follows the foreground; background utilities need their own class.
const DOT: Record<Tone, string> = {
  success: "bg-klerosUIComponentsSuccess",
  warning: "bg-klerosUIComponentsWarning",
  error: "bg-klerosUIComponentsError",
  info: "bg-klerosUIComponentsPrimaryBlue",
  neutral: "bg-klerosUIComponentsSecondaryText",
  accent: "bg-klerosUIComponentsPrimaryPurple",
};

/**
 * Foreground and background classes for a tone, to tint other elements the same way as `StatusBadge`.
 * @example <div className={cn("rounded-base px-4 py-3", toneClasses("warning"))}>Heads up</div>
 */
export function toneClasses(tone: Tone): string {
  return TONE[tone];
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colour meaning of the status. */
  tone: Tone;
  /** The status text, e.g. "Voting". */
  children: React.ReactNode;
  /** Shows a small coloured dot before the text. */
  dot?: boolean;
}

/**
 * Small pill for a status, such as a case period or a transaction state.
 * @intent status, badge, pill, chip, label, state, period, tag, success, warning, error
 * @example <StatusBadge tone="success" dot>Executed</StatusBadge>
 */
export function StatusBadge({ tone, children, dot, className, ...props }: Readonly<StatusBadgeProps>) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", TONE[tone], className)}
      {...props}
    >
      {dot && <span aria-hidden className={cn("size-2 rounded-full", DOT[tone])} />}
      {children}
    </span>
  );
}
