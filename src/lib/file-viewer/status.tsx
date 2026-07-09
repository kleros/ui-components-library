import React from "react";
import { cn } from "../../utils";

/** Shared muted status line used by renderers for loading / error / empty
 * states, so every renderer speaks with the same visual voice. */
export const ViewerMessage = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "text-klerosUIComponentsSecondaryText text-sm",
      "flex min-h-24 items-center justify-center p-6 text-center",
      className,
    )}
  >
    {children}
  </div>
);
