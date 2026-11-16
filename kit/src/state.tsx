import React from "react";
import { AlertMessage, Button } from "@kleros/ui-components-library";
import { EmptyState, Skeleton, type EmptyStateProps } from "./feedback.js";
import { cn } from "./cn.js";

export interface ErrorStateProps {
  /** @default "Something went wrong" */
  title?: string;
  /** Detail under the title. @default "Please try again." */
  message?: string;
  /** When set, a "Retry" button is shown. */
  onRetry?: () => void;
  className?: string;
}

/**
 * Error block for a failed load: core `AlertMessage` plus an optional Retry button.
 * @intent error, failed, something went wrong, retry, load failure, error message, fetch error
 * @example <ErrorState message={error.message} onRetry={refetch} />
 */
export function ErrorState({ title = "Something went wrong", message = "Please try again.", onRetry, className }: Readonly<ErrorStateProps>) {
  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      <AlertMessage variant="error" title={title} msg={message} className="w-full" />
      {onRetry && <Button variant="secondary" small text="Retry" onPress={onRetry} />}
    </div>
  );
}

export interface QueryStateProps<T> {
  /** True while the first load is in flight. */
  isLoading: boolean;
  /**
   * True while there is no data yet, a query that has not started included: TanStack Query's and wagmi's `isPending`,
   * which a disabled query (`enabled: false`, waiting for an address or an id) keeps. With no `data`, the skeleton
   * shows instead of the empty state. Spreading the query result passes it. @default false
   */
  isPending?: boolean;
  /**
   * True when the request failed. The error shows only when there is no data (`undefined` or `null`) or it counts as
   * empty: when a refetch fails after a load, the loaded data stays on screen.
   */
  isError?: boolean;
  /** The failure; its `message` is shown when it is an `Error`. */
  error?: unknown;
  /** The loaded data, `undefined` until it arrives. */
  data: T | undefined;
  /** Decides when `data` counts as empty. @default arrays with length 0 */
  isEmpty?: (data: T) => boolean;
  /** Replaces the default skeleton rows while loading. */
  loading?: React.ReactNode;
  /**
   * Shown when there is no data; omit `empty` to get a generic "Nothing here yet". `action` takes what `EmptyState`'s
   * `action` takes (`{ text, onPress }` or a node) and sits in the same place, under the description.
   */
  empty?: { title: string; description?: string; action?: EmptyStateProps["action"] };
  /** Title of the error state. @default "Something went wrong" */
  errorTitle?: string;
  /** Shows a Retry button in the error state. */
  onRetry?: () => void;
  /** Renders the loaded, non-empty data. */
  children: (data: T) => React.ReactNode;
}

/**
 * Handles the loading, error, empty and loaded states of one request in a single place.
 * Fits TanStack Query and wagmi results directly: `<QueryState {...query}>` works because they expose `{ isLoading, isPending, isError, data }`.
 * @intent loading, error, empty, data fetching, query state, skeleton, retry, tanstack query, react-query, wagmi, async state
 * @example
 * <QueryState {...useQuery(casesQuery)} empty={{ title: "No cases" }}>
 *   {(cases) => <DataTable rows={cases} rowKey={(c) => c.id} columns={columns} />}
 * </QueryState>
 */
export function QueryState<T>({ isLoading, isPending, isError, error, data, isEmpty, loading, empty, errorTitle, onRetry, children }: Readonly<QueryStateProps<T>>) {
  if (isLoading || (isPending && data === undefined)) {
    return (
      <>
        {loading ?? (
          <div className="flex flex-col gap-2">
            <Skeleton count={3} className="h-8" />
          </div>
        )}
      </>
    );
  }
  const isEmptyData = data === undefined || (isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0);
  // A failed refetch keeps the loaded data: the error replaces only an empty view, or a null one (a hand-rolled hook
  // that starts at useState(null)). A successful null still goes to children.
  if (isError && (data === null || isEmptyData)) {
    return (
      <ErrorState title={errorTitle} message={error instanceof Error ? error.message : undefined} onRetry={onRetry} />
    );
  }
  if (isEmptyData) {
    return (
      <EmptyState
        title={empty?.title ?? "Nothing here yet"}
        description={empty?.description}
        action={empty?.action}
      />
    );
  }
  return <>{children(data)}</>;
}
