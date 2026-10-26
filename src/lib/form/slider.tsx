import React, { useRef } from "react";
import { useIsomorphicLayoutEffect } from "usehooks-ts";
import { cn, isUndefined } from "../../utils";
import {
  Slider as AriaSlider,
  Label,
  type SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";

interface SliderProps
  extends Omit<AriaSliderProps, "orientation" | "formatOptions"> {
  leftLabel: string;
  rightLabel: string;
  /** Format the value to be displayed on the Slider Thumb. Screen readers announce the same text. */
  formatter?: (value: number) => string;
  /** Callback function that provides the selected value as an argument. */
  callback: (value: number) => void;
  /** Override default theme of Slider */
  theme?: {
    sliderColor: string;
    trackColor: string;
    thumbColor: string;
    labelColor: string;
  };
}

/**
 * Gives the thumb's input the text its value label shows. react-aria sets
 * `aria-valuetext` to the plain number and has no prop for other text, so this
 * runs after every commit, once react-aria has written its own.
 */
function ValueTextBridge({
  inputRef,
  valueText,
}: Readonly<{
  inputRef: React.RefObject<HTMLInputElement>;
  valueText: string;
}>) {
  useIsomorphicLayoutEffect(() => {
    const input = inputRef.current;
    if (input && input.getAttribute("aria-valuetext") !== valueText)
      input.setAttribute("aria-valuetext", valueText);
  });
  return null;
}

/**
 * Slider allows a user to select a value within a range. Give it an
 * `aria-label` or `aria-labelledby`: otherwise its input has no name of its own.
 */
function Slider({
  leftLabel,
  rightLabel,
  formatter,
  callback,
  theme,
  onChange,
  ...props
}: Readonly<SliderProps>) {
  const { sliderColor, thumbColor, labelColor, trackColor } = theme ?? {};
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <AriaSlider
      className={cn("mt-4 box-border w-125")}
      {...props}
      onChange={(value) => {
        onChange?.(value);
        callback(value as number);
      }}
    >
      {/* react-aria names the input after the slider's label, or else after
          the group, and browsers read the group's text there, not its
          aria-labelledby. So an empty label takes the group's place, and the
          thumb gets the aria-labelledby and the aria-label. */}
      {props["aria-labelledby"] && <Label className="hidden" />}
      <SliderTrack className="relative h-7 w-full">
        {({ state, isDisabled }) => {
          const valueText = formatter
            ? formatter(state.getThumbValue(0))
            : state.getThumbValueLabel(0);
          return (
            <>
              {/* track */}
              <div
                id="slider-track"
                data-slot="slider-track"
                className={cn(
                  "absolute top-1/2 -translate-y-1/2",
                  "h-2 w-full cursor-pointer rounded-[30px]",
                  isDisabled && "cursor-default",
                )}
                style={{
                  backgroundColor:
                    trackColor ?? "var(--klerosUIComponentsStroke)",
                }}
              />
              {/* fill */}
              <div
                id="slider-fill"
                data-slot="slider-fill"
                className={cn(
                  "absolute top-1/2 h-2 -translate-y-1/2",
                  "cursor-pointer rounded-[30px]",
                  isDisabled &&
                    "bg-klerosUIComponentsSecondaryText cursor-default",
                )}
                style={{
                  width: state.getThumbPercent(0) * 100 + "%",
                  backgroundColor:
                    sliderColor ?? "var(--klerosUIComponentsPrimaryBlue)",
                }}
              />
              <SliderThumb
                inputRef={inputRef}
                aria-labelledby={props["aria-labelledby"]}
                // without aria-labelledby, the group passes the aria-label on
                aria-label={
                  props["aria-labelledby"] ? props["aria-label"] : undefined
                }
                data-slot="slider-thumb"
                className={cn(
                  "dragging:bg-klerosUIComponentsLightBlue bg-klerosUIComponentsWhiteBackground",
                  "relative top-1/2 size-6",
                  "rounded-full border-3 border-solid",
                  "cursor-pointer outline-hidden transition",
                  isDisabled &&
                    "border-klerosUIComponentsSecondaryText cursor-default",
                  isUndefined(thumbColor) && "dragging:shadow-input",
                )}
                style={{
                  borderColor:
                    thumbColor ?? "var(--klerosUIComponentsPrimaryBlue)",
                }}
              >
                {/* A caption, like the two below: a <label> element, which
                    apps style, that labels nothing. Hidden, since the input
                    announces the same text. */}
                <label
                  id="slider-label"
                  data-slot="slider-label"
                  aria-hidden
                  className={cn(
                    "absolute -top-7 left-1/2 w-max -translate-x-1/2",
                    "text-sm",
                    isDisabled && "hidden",
                  )}
                  style={{
                    color: labelColor ?? "var(--klerosUIComponentsPrimaryBlue)",
                  }}
                >
                  {valueText}
                </label>
              </SliderThumb>
              <ValueTextBridge
                inputRef={inputRef}
                // an empty text would leave screen readers no value
                valueText={valueText || state.getThumbValueLabel(0)}
              />
            </>
          );
        }}
      </SliderTrack>
      <div className="mt-2 flex w-full items-center justify-between">
        {leftLabel && (
          <label
            id="slider-left-label"
            data-slot="slider-left-label"
            className="text-klerosUIComponentsPrimaryText text-sm break-words"
          >
            {leftLabel}
          </label>
        )}
        {rightLabel && (
          <label
            id="slider-right-label"
            data-slot="slider-right-label"
            className="text-klerosUIComponentsPrimaryText text-sm break-words"
          >
            {rightLabel}
          </label>
        )}
      </div>
    </AriaSlider>
  );
}

export default Slider;
