import React from "react";
import { AlertMessage, Button } from "@kleros/ui-components-library";
import { EmptyState, Skeleton } from "./feedback.js";
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
  /** True when the request failed. */
  isError?: boolean;
  /** The failure; its `message` is shown when it is an `Error`. */
  error?: unknown;
  /** The loaded data, `undefined` until it arrives. */
  data: T | undefined;
  /** Decides when `data` counts as empty. @default arrays with length 0 */
  isEmpty?: (data: T) => boolean;
  /** Replaces the default skeleton rows while loading. */
  loading?: React.ReactNode;
  /** Shown when there is no data; omit `empty` to get a generic "Nothing here yet". */
  empty?: { title: string; description?: string; action?: React.ReactNode };
  /** Shows a Retry button in the error state. */
  onRetry?: () => void;
  /** Renders the loaded, non-empty data. */
  children: (data: T) => React.ReactNode;
}

/**
 * Handles the loading, error, empty and loaded states of one request in a single place.
 * Fits TanStack Query and wagmi results directly: `<QueryState {...query}>` works because they expose `{ isLoading, isError, data }`.
 * @intent loading, error, empty, data fetching, query state, skeleton, retry, tanstack query, react-query, wagmi, async state
 * @example
 * <QueryState {...useQuery(casesQuery)} empty={{ title: "No cases" }}>
 *   {(cases) => <DataTable rows={cases} rowKey={(c) => c.id} columns={columns} />}
 * </QueryState>
 */
export function QueryState<T>({ isLoading, isError, error, data, isEmpty, loading, empty, onRetry, children }: Readonly<QueryStateProps<T>>) {
  if (isLoading) {
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
  if (isError) {
    return <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={onRetry} />;
  }
  const isEmptyData = data === undefined || (isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0);
  if (isEmptyData) {
    return (
      <div className="flex flex-col items-center gap-3">
        <EmptyState title={empty?.title ?? "Nothing here yet"} description={empty?.description} />
        {empty?.action}
      </div>
    );
  }
  return <>{children(data)}</>;
}
