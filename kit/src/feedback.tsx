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
 * @example <Spinner size={16} />
 */
export function Spinner({ size = 24, label = "Loading", className }: Readonly<SpinnerProps>) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn(
        "border-klerosUIComponentsStroke border-t-klerosUIComponentsPrimaryBlue inline-block animate-spin rounded-full border-2",
        className,
      )}
    />
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional call to action, rendered as a library `Button`. */
  action?: { text: string; onPress: () => void };
  icon?: React.ReactNode;
  className?: string;
}

/**
 * What to show when a list or search has no results.
 * @example <EmptyState title="No cases found" description="Try another court." action={{ text: "Clear filters", onPress: reset }} />
 */
export function EmptyState({ title, description, action, icon, className }: Readonly<EmptyStateProps>) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-6 py-12 text-center", className)}>
      {icon}
      <p className="text-klerosUIComponentsPrimaryText text-lg font-semibold">{title}</p>
      {description && <p className="text-klerosUIComponentsSecondaryText text-sm">{description}</p>}
      {action && <Button variant="secondary" small text={action.text} onPress={action.onPress} />}
    </div>
  );
}

export interface InfoCardProps {
  children: React.ReactNode;
  /** Border and accent colour. @default "info" */
  variant?: "info" | "warning" | "success" | "error";
  className?: string;
}

/**
 * Inline notice box with free content (children). For a titled status message use the core `AlertMessage` (`title` + `msg`).
 * @example <InfoCard variant="warning">Voting closes in 2 hours.</InfoCard>
 */
export function InfoCard({ children, variant = "info", className }: Readonly<InfoCardProps>) {
  const tone = {
    info: "border-klerosUIComponentsPrimaryBlue bg-klerosUIComponentsMediumBlue",
    warning: "border-klerosUIComponentsWarning bg-klerosUIComponentsWarningLight",
    success: "border-klerosUIComponentsSuccess bg-klerosUIComponentsSuccessLight",
    error: "border-klerosUIComponentsError bg-klerosUIComponentsErrorLight",
  }[variant];
  return (
    <div role="note" className={cn("rounded-base text-klerosUIComponentsPrimaryText border px-4 py-3 text-sm", tone, className)}>
      {children}
    </div>
  );
}
