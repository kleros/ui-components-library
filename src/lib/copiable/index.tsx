import React, { useState } from "react";
import Tooltip, { TooltipBaseProps } from "../tooltip";
import Copy from "../../assets/svgs/copiable/copy.svg";
import Copied from "../../assets/svgs/copiable/copied.svg";
import { cn } from "../../utils";
import { Button } from "react-aria-components";

interface CopiableBaseProps {
  /** Content that should be copied to user's clipboard. */
  copiableContent: string;
  /** Optional info to display in tooltip. */
  info?: string;
  /** Placement of Copy Icon
   * @default right
   */
  iconPlacement?: "left" | "right";
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
 */
function Copiable({
  copiableContent,
  info,
  children,
  tooltipProps,
  iconPlacement = "right",
  className,
  ...props
}: Readonly<CopiableProps>) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(copiableContent)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => setIsCopied(false));
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
          onPress={isCopied ? undefined : handleCopy}
          className="flex h-4 w-4 cursor-pointer items-center"
        >
          {isCopied ? (
            <Copied className="copied-icon" />
          ) : (
            <Copy className="copy-icon" />
          )}
        </Button>
      </Tooltip>
    </div>
  );
}

export default Copiable;
