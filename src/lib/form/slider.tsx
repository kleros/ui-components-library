import React from "react";
import { cn } from "../../utils";
import {
  Slider as AriaSlider,
  Label,
  SliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";

interface SliderProps
  extends Omit<AriaSliderProps, "orientation" | "formatOptions"> {
  leftLabel: string;
  rightLabel: string;
  /** Format the value to be displayed on the Slider Thumb. */
  formatter?: (value: number) => string;
  /** Callback function that provides the selected value as an argument. */
  callback: (value: number) => void;
}

/** Slider allows a user to select a value within a range. */
function Slider({
  leftLabel,
  rightLabel,
  formatter,
  callback,
  ...props
}: Readonly<SliderProps>) {
  return (
    <AriaSlider
      className={cn("mt-4 box-border w-125")}
      {...props}
      onChange={callback}
    >
      <SliderTrack className="relative h-7 w-full">
        {({ state, isDisabled }) => (
          <>
            <Label className="hidden">{state.getThumbValue(0)}</Label>
            {/* track */}
            <div
              className={cn(
                "bg-klerosUIComponentsStroke absolute top-1/2 -translate-y-1/2",
                "h-2 w-full cursor-pointer rounded-[30px]",
                isDisabled && "cursor-default",
              )}
            />
            {/* fill */}
            <div
              className={cn(
                "bg-klerosUIComponentsPrimaryBlue absolute top-1/2 h-2 -translate-y-1/2",
                "cursor-pointer rounded-[30px]",
                isDisabled &&
                  "bg-klerosUIComponentsSecondaryText cursor-default",
              )}
              style={{ width: state.getThumbPercent(0) * 100 + "%" }}
            />
            <SliderThumb
              className={cn(
                "dragging:bg-klerosUIComponentsLightBlue bg-klerosUIComponentsWhiteBackground relative top-1/2 size-6",
                "border-klerosUIComponentsPrimaryBlue rounded-full border-3 border-solid",
                "dragging:shadow-input cursor-pointer outline-hidden transition",
                isDisabled &&
                  "border-klerosUIComponentsSecondaryText cursor-default",
              )}
            >
              <Label
                className={cn(
                  "absolute -top-7 left-1/2 w-max -translate-x-1/2",
                  "text-klerosUIComponentsPrimaryBlue text-sm",
                  isDisabled && "hidden",
                )}
              >
                {formatter ? (
                  formatter(state.getThumbValue(0))
                ) : (
                  <SliderOutput />
                )}
              </Label>
            </SliderThumb>
          </>
        )}
      </SliderTrack>
      <div className="mt-2 flex w-full items-center justify-between">
        {leftLabel && (
          <Label
            className="text-klerosUIComponentsPrimaryText text-sm break-words"
            aria-label="min-label"
          >
            {leftLabel}
          </Label>
        )}
        {rightLabel && (
          <Label
            className="text-klerosUIComponentsPrimaryText text-sm break-words"
            aria-label="max-label"
          >
            {rightLabel}
          </Label>
        )}
      </div>
    </AriaSlider>
  );
}

export default Slider;
