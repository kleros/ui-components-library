import React from "react";
import { cn } from "./cn.js";

/** Semantic colour of a status. */
export type Tone = "success" | "warning" | "error" | "info" | "neutral" | "accent";

// Fills, all tokens in theme.css: SuccessLight, WarningLight, ErrorLight, MediumBlue, Stroke, MediumPurple. Text is
// PrimaryText in every tone, and the tone shows in the fill and the dot. A tone's own colour as text fails 4.5:1 on its
// fill in light (Success 2.22:1, Warning 2.05:1, Error 3.78:1, PrimaryBlue 2.79:1); PrimaryText is 11.41:1 or more on
// those four in light and 9.96:1 or more in dark. Accent text is not PrimaryPurple either: on MediumPurple it is 2.05:1
// in dark. Neutral fills with Stroke, not LightGrey: LightGrey is 1.01:1 on LightBackground in light, so the pill
// vanished; Stroke is 1.22:1 there (1.60:1 on the dark LightBackground), with PrimaryText 10:1 on it in both modes
// (SecondaryText is 2.26:1 in light). The four tinted fills are 1.05:1 to 1.11:1 on WhiteBackground in light, so there
// the dot, on by default, tells the tones apart.
const TONE: Record<Tone, string> = {
  success: "text-klerosUIComponentsPrimaryText bg-klerosUIComponentsSuccessLight",
  warning: "text-klerosUIComponentsPrimaryText bg-klerosUIComponentsWarningLight",
  error: "text-klerosUIComponentsPrimaryText bg-klerosUIComponentsErrorLight",
  info: "text-klerosUIComponentsPrimaryText bg-klerosUIComponentsMediumBlue",
  neutral: "text-klerosUIComponentsPrimaryText bg-klerosUIComponentsStroke",
  accent: "text-klerosUIComponentsPrimaryText bg-klerosUIComponentsMediumPurple",
};

// The dot is in the tone's own colour. Accent's is SecondaryPurple, the purple that clears 3:1 on MediumPurple in both
// modes (5.13:1 light, 4.13:1 dark), where PrimaryPurple is 2.05:1 in dark.
const DOT: Record<Tone, string> = {
  success: "bg-klerosUIComponentsSuccess",
  warning: "bg-klerosUIComponentsWarning",
  error: "bg-klerosUIComponentsError",
  info: "bg-klerosUIComponentsPrimaryBlue",
  neutral: "bg-klerosUIComponentsPrimaryText",
  accent: "bg-klerosUIComponentsSecondaryPurple",
};

/**
 * Foreground and background classes for a tone, to tint other elements the same way as `StatusBadge`.
 * The text class is `text-klerosUIComponentsPrimaryText` in every tone, which keeps 4.5:1 on each fill in light and
 * dark; the tone is in the fill (`bg-klerosUIComponentsWarningLight` for "warning"). The fills are faint in light
 * (1.05:1 to 1.11:1 on WhiteBackground), so give the element something else in the tone too, such as an icon. For a
 * notice box, kit `InfoCard` already adds the tone's border and an icon.
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
  /**
   * Shows a small dot in the tone's colour before the text. In light mode the fills are faint, so the dot is what
   * tells the tones apart: pass `dot={false}` only where the text alone says enough.
   * @default true
   */
  dot?: boolean;
}

/**
 * Small pill for a status, such as a case period or a transaction state.
 * The text is PrimaryText in every tone; the tone shows in the fill and in the dot, which is on unless `dot={false}`.
 * @intent status, badge, pill, chip, label, state, period, tag, success, warning, error
 * @example <StatusBadge tone="success">Executed</StatusBadge>
 */
export function StatusBadge({ tone, children, dot = true, className, ...props }: Readonly<StatusBadgeProps>) {
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
