import React from "react";
import { cn } from "../../utils";
import clsx from "clsx";
import {
  TooltipTrigger,
  Focusable,
  OverlayArrow,
  Tooltip as AriaTooltip,
  type TooltipTriggerComponentProps,
  type TooltipProps as AriaTooltipProps,
  type OverlayArrowProps,
} from "react-aria-components";

export interface TooltipBaseProps extends TooltipTriggerComponentProps {
  place?: "left" | "right" | "top" | "bottom";
  small?: boolean;
  /** Props for Tooltip popup.
   * [See Tooltip Props](https://react-spectrum.adobe.com/react-aria/Tooltip.html#tooltip-1)
   */
  tooltipProps?: AriaTooltipProps;
  /** Props for Tooltip arrow.
   * [See  OverlayArrow Props](https://react-spectrum.adobe.com/react-aria/Tooltip.html#overlayarrow)
   */
  overlayArrowProps?: OverlayArrowProps;
  /** Props for children wrapper. */
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
}

interface TooltipProps extends TooltipBaseProps {
  text: string;
  /** @description Applies to Tooltip container. */
  className?: string;
}

function Tooltip({
  place = "top",
  text,
  children,
  small,
  className,
  delay = 0,
  ...props
}: TooltipProps) {
  return (
    <TooltipTrigger {...{ delay }} {...props}>
      <Focusable>
        <div {...props.wrapperProps}>{children}</div>
      </Focusable>
      <AriaTooltip
        offset={props.tooltipProps?.offset ?? 8}
        placement={place}
        {...props.tooltipProps}
        className={cn(
          "bg-klerosUIComponentsLightBlue w-max max-w-60",
          "border-klerosUIComponentsStroke box-border rounded-[7px] border",
          "flex items-center justify-center px-4 py-[13px]",
          "entering:animate-fade-in exiting:animate-fade-out",
          className,
        )}
      >
        <OverlayArrow
          {...props.overlayArrowProps}
          className={({ placement }) =>
            cn(
              "absolute border-8 border-solid content-['']",
              "after:absolute after:border-7 after:border-solid after:content-['']",
              placement === "top" && [
                "top-full left-1/2",
                "after:-top-[8.5px] after:-left-[7px]",
                "border-t-klerosUIComponentsStroke after:border-t-klerosUIComponentsLightBlue",
                "border-r-transparent border-b-transparent border-l-transparent",
                "after:border-r-transparent after:border-b-transparent after:border-l-transparent",
              ],
              placement === "right" && [
                "top-1/2 right-full",
                "after:-top-[7px] after:-left-[5.5px]",
                "border-r-klerosUIComponentsStroke after:border-r-klerosUIComponentsLightBlue",
                "border-t-transparent border-b-transparent border-l-transparent",
                "after:border-t-transparent after:border-b-transparent after:border-l-transparent",
              ],
              placement === "bottom" && [
                "bottom-full left-1/2",
                "after:-top-[5.5px] after:-left-[7px]",
                "border-b-klerosUIComponentsStroke after:border-b-klerosUIComponentsLightBlue",
                "border-t-transparent border-r-transparent border-l-transparent",
                "after:border-t-transparent after:border-r-transparent after:border-l-transparent",
              ],
              placement === "left" && [
                "top-1/2 left-full",
                "after:-top-[7px] after:-left-[8.5px]",
                "border-l-klerosUIComponentsStroke after:border-l-klerosUIComponentsLightBlue",
                "border-t-transparent border-r-transparent border-b-transparent",
                "after:border-t-transparent after:border-r-transparent after:border-b-transparent",
              ],
              props.overlayArrowProps?.className,
            )
          }
        />
        <small
          className={clsx(
            "text-klerosUIComponentsPrimaryText font-thin break-words",
            small ? "text-center" : "text-left",
          )}
        >
          {text}
        </small>
      </AriaTooltip>
    </TooltipTrigger>
  );
}

export default Tooltip;
