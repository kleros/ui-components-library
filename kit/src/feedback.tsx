import React from "react";
import { Button } from "@kleros/ui-components-library";
import { cn } from "./cn.js";

export interface SkeletonProps {
  /** Tailwind size classes, e.g. `"h-6 w-40"`. @default "h-4 w-full" */
  className?: string;
  /** Render this many stacked bars. @default 1 */
  count?: number;
}

/**
 * Loading placeholder in the library's skeleton colours. Use it while data loads; it is not a spinner.
 * @example {isLoading ? <Skeleton className="h-24 w-full" count={3} /> : <List />}
 */
export function Skeleton({ className, count = 1 }: Readonly<SkeletonProps>) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className={cn("bg-klerosUIComponentsSkeletonBackground rounded-base h-4 w-full animate-pulse", className)}
        />
      ))}
    </>
  );
}

export interface SpinnerProps {
  /** Pixel size. @default 24 */
  size?: number;
  /** Accessible label. @default "Loading" */
  label?: string;
  className?: string;
}

/**
 * Small indeterminate spinner for buttons and inline waits. For a page or list that is loading, prefer `Skeleton`.
 * It keeps its `size` in a flex row (it does not shrink), so it stays round next to wrapping text.
 * @example <Spinner size={16} />
 */
export function Spinner({ size = 24, label = "Loading", className }: Readonly<SpinnerProps>) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn(
        "border-klerosUIComponentsStroke border-t-klerosUIComponentsPrimaryBlue",
        "inline-block shrink-0 animate-spin rounded-full border-2",
        className,
      )}
    />
  );
}

/** The `{ text, onPress }` form of `EmptyState`'s `action`. */
type ButtonAction = { text: string; onPress: () => void };

export interface EmptyStateProps {
  title: string;
  description?: string;
  /**
   * Optional call to action under the description. `{ text, onPress }` renders a small secondary library `Button`;
   * a node (your own `Button`, a link) is rendered as given, in the same place.
   */
  action?: ButtonAction | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

function isButtonAction(action: EmptyStateProps["action"]): action is ButtonAction {
  return typeof action === "object" && action !== null && !React.isValidElement(action) && "onPress" in action;
}

/**
 * What to show when a list or search has no results.
 * @example <EmptyState title="No cases found" description="Try another court." action={{ text: "Clear filters", onPress: reset }} />
 * @example <EmptyState title="No cases yet" action={<Button small text="Create a case" onPress={create} />} />
 */
export function EmptyState({ title, description, action, icon, className }: Readonly<EmptyStateProps>) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-6 py-12 text-center", className)}>
      {icon}
      <p className="text-klerosUIComponentsPrimaryText text-lg font-semibold">{title}</p>
      {description && <p className="text-klerosUIComponentsSecondaryText text-sm">{description}</p>}
      {isButtonAction(action) ? (
        <Button variant="secondary" small text={action.text} onPress={action.onPress} />
      ) : (
        action
      )}
    </div>
  );
}

export interface InfoCardProps {
  children: React.ReactNode;
  /** Border, fill and icon colour, icon shape, and the variant word read to screen readers. @default "info" */
  variant?: "info" | "warning" | "success" | "error";
  className?: string;
}

type InfoCardVariant = NonNullable<InfoCardProps["variant"]>;

// One glyph per variant inside the same circle, as in the core AlertMessage's status icons: i, !, check, cross.
const INFO_GLYPH: Record<InfoCardVariant, string> = {
  info: "M8 7.25v4M8 4.75h.01",
  warning: "M8 4.75v4M8 11.25h.01",
  success: "M5.25 8.25 7.25 10.25 10.75 5.75",
  error: "M5.75 5.75l4.5 4.5M10.25 5.75l-4.5 4.5",
};

// Read before the content, so the variant does not rest on colour alone.
const INFO_WORD: Record<InfoCardVariant, string> = {
  info: "Information",
  warning: "Warning",
  success: "Success",
  error: "Error",
};

/**
 * Inline notice box with free content (children). For a titled status message use the core `AlertMessage` (`title` + `msg`).
 * A small icon per variant (a ring in the variant's colour around a glyph in the text colour) sits before the content,
 * and screen readers hear the variant word ("Warning: …") first, so the variant is not shown by colour alone.
 * @example <InfoCard variant="warning">Voting closes in 2 hours.</InfoCard>
 */
export function InfoCard({ children, variant = "info", className }: Readonly<InfoCardProps>) {
  const tone = {
    info: "border-klerosUIComponentsPrimaryBlue bg-klerosUIComponentsMediumBlue",
    warning: "border-klerosUIComponentsWarning bg-klerosUIComponentsWarningLight",
    success: "border-klerosUIComponentsSuccess bg-klerosUIComponentsSuccessLight",
    error: "border-klerosUIComponentsError bg-klerosUIComponentsErrorLight",
  }[variant];
  const iconColour = {
    info: "text-klerosUIComponentsPrimaryBlue",
    warning: "text-klerosUIComponentsWarning",
    success: "text-klerosUIComponentsSuccess",
    error: "text-klerosUIComponentsError",
  }[variant];
  return (
    <div
      role="note"
      className={cn(
        "rounded-base text-klerosUIComponentsPrimaryText flex gap-3 border px-4 py-3 text-sm",
        tone,
        className,
      )}
    >
      {/* 16px on the 20px first line of text-sm: mt-0.5 centres it on that line. */}
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("mt-0.5 size-4 shrink-0", iconColour)}
      >
        <circle cx="8" cy="8" r="6.75" />
        {/* The glyph tells the variants apart, so it is drawn in PrimaryText (3:1 or more on every fill, both modes). */}
        <path d={INFO_GLYPH[variant]} className="stroke-klerosUIComponentsPrimaryText" />
      </svg>
      <div className="min-w-0 flex-1">
        <span className="sr-only">{`${INFO_WORD[variant]}: `}</span>
        {children}
      </div>
    </div>
  );
}
