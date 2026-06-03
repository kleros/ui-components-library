import React from "react";
import { type RadioRenderProps } from "react-aria-components";
import { cn } from "../../utils";

interface RadioIndicatorProps extends Partial<RadioRenderProps> {
  small?: boolean;
  /** Show the focus-visible outline on the circle itself (default). Set `false` when the
   *  surrounding option already renders its own focus ring (e.g. a card whose whole surface
   *  is the target), so you don't get a ring on both the card and the circle. */
  focusRing?: boolean;
  className?: string;
}

/** The standard radio circle, decoupled from layout so a caller can place it anywhere
 *  (e.g. on the right of a card, or absolutely positioned beside a label). Spread the
 *  react-aria render props (`isSelected`, `isHovered`, `isFocusVisible`, ...) onto it to
 *  drive its state. Shared by `Radio` (the plain group) and `CustomRadio`. */
export function RadioIndicator({
  small,
  isSelected,
  isHovered,
  isPressed,
  isFocusVisible,
  isDisabled,
  focusRing = true,
  className,
}: Readonly<RadioIndicatorProps>) {
  return (
    <span
      aria-hidden
      className={cn(
        "border-klerosUIComponentsStroke relative box-border inline-block shrink-0 rounded-full border",
        "after:bg-klerosUIComponentsPrimaryBlue after:absolute after:hidden after:rounded-full",
        "ease-ease after:ease-ease transition-all after:transition-all",
        small
          ? "size-4 after:top-0.75 after:left-0.75 after:size-2"
          : "size-6 after:top-1.25 after:left-1.25 after:size-3",
        isSelected && [
          "bg-klerosUIComponentsWhiteBackground border-klerosUIComponentsPrimaryBlue after:block",
        ],
        isHovered && [
          "border-klerosUIComponentsSecondaryBlue bg-klerosUIComponentsLightBlue",
        ],
        isPressed && [
          "border-klerosUIComponentsSecondaryBlue after:bg-klerosUIComponentsSecondaryBlue",
        ],
        isFocusVisible &&
          focusRing && [
            "outline-klerosUIComponentsPrimaryBlue outline-2 outline-offset-2",
          ],
        isDisabled && ["border-klerosUIComponentsStroke after:hidden"],
        className,
      )}
    />
  );
}
