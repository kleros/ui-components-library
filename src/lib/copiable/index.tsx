import React, { useEffect, useState } from "react";
import Tooltip, { TooltipBaseProps } from "../tooltip";
import Copy from "../../assets/svgs/copiable/copy.svg";
import Copied from "../../assets/svgs/copiable/copied.svg";
import { cn } from "../../utils";
import { Button } from "react-aria-components";

interface CopiableBaseProps {
  /** Content that should be copied to user's clipboard. */
  copiableContent: string;
  /**
   * Optional info to display in tooltip. It is also the copy button's
   * accessible name.
   * @default Copy
   */
  info?: string;
  /** Placement of Copy Icon
   * @default right
   */
  iconPlacement?: "left" | "right";
  /** Called after the content was written to the clipboard. */
  onCopy?: () => void;
  /**
   * Called when the clipboard write fails, e.g. the permission was denied or
   * the page is not in a secure context. A "Copy failed" message is also
   * announced to screen readers.
   */
  onCopyError?: (error: unknown) => void;
  /**
   * How long, in milliseconds, the "Copied" feedback stays before the button
   * is ready again.
   * @default 2000
   */
  feedbackDuration?: number;
}

interface CopiableProps extends CopiableBaseProps {
  children?: React.ReactNode;
  tooltipProps?: Omit<TooltipBaseProps, "children">;
  className?: string;
}

/**
 * @description Wraps a component to make it copiable.
 * @param copiableContent The text to be copied to user's clipboard
 * @param info Modify the message displayed in the copy button's tooltip
 * @param tooltipProps Copy button's tooltip props
 * @param onCopy Called after a successful copy
 * @param onCopyError Called with the error when copying fails
 */
function Copiable({
  copiableContent,
  info,
  children,
  tooltipProps,
  iconPlacement = "right",
  className,
  onCopy,
  onCopyError,
  feedbackDuration = 2000,
  ...props
}: Readonly<CopiableProps>) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const isCopied = status === "copied";

  useEffect(() => {
    if (status === "idle") return;
    const timeout = setTimeout(() => setStatus("idle"), feedbackDuration);
    return () => clearTimeout(timeout);
  }, [status, feedbackDuration]);

  const handleCopy = async () => {
    try {
      // `navigator.clipboard` is missing outside secure contexts, which throws here
      await navigator.clipboard.writeText(copiableContent);
    } catch (error) {
      setStatus("failed");
      onCopyError?.(error);
      return;
    }
    setStatus("copied");
    onCopy?.();
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2",
        iconPlacement === "left" ? "flex-row-reverse" : "flex-row",
        className,
      )}
      {...props}
    >
      {children}
      <Tooltip
        text={isCopied ? "Copied!" : `${info ?? "Copy"}`}
        {...tooltipProps}
      >
        <Button
          aria-label={info ?? "Copy"}
          onPress={isCopied ? undefined : handleCopy}
          className="flex size-4 cursor-pointer items-center"
        >
          {isCopied ? (
            <Copied className="copied-icon" />
          ) : (
            <Copy className="copy-icon" />
          )}
        </Button>
      </Tooltip>
      <span role="status" className="sr-only">
        {status === "copied" && "Copied"}
        {status === "failed" && "Copy failed"}
      </span>
    </div>
  );
}

export default Copiable;
