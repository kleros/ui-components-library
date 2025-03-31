import React, { ReactNode, useMemo } from "react";
import {
  Label,
  ProgressBar,
  type ProgressBarProps,
} from "react-aria-components";
import clsx from "clsx";
import { cn, isUndefined } from "../../../utils";
import HourglassIcon from "../../../assets/svgs/hourglass.svg";

interface LinearProps
  extends Omit<ProgressBarProps, "isIndeterminate" | "formatOptions"> {
  timerText?: ReactNode;
  /** Provides the current progress value.
   * When minValue and maxValue are not defined, it represents the percentage value between 0-100%. */
  value: number;
  /** Whether the progress bas should animate to it's value. */
  animated?: boolean;
  width: number;
}

/** Linear progress shows determinate progress of an operation over time. */
function Linear({
  value,
  valueLabel,
  width,
  timerText,
  minValue = 0,
  maxValue = 100,
  animated = true,
  className,
  ...props
}: Readonly<LinearProps>) {
  const sw = 8;
  const progress = useMemo(
    () => (value / (maxValue - minValue)) * 100,
    [value, minValue, maxValue],
  );

  const linePath = `M ${sw / 2} ${sw / 2} h ${width - sw}`;

  return (
    <ProgressBar
      className={cn(
        "box-border flex flex-col items-center",
        "text-klerosUIComponentsStroke text-sm",
        className,
      )}
      {...props}
      {...{ value, valueLabel, minValue, maxValue }}
    >
      <Label
        className={clsx(
          "text-klerosUIComponentsPrimaryText text-base break-words",
          isUndefined(valueLabel) && "hidden",
        )}
      >
        {valueLabel ?? `Progress ${progress}`}
      </Label>
      <div className="flex flex-col items-start">
        <svg
          className={"mx-auto my-2.5 block fill-none"}
          height={sw}
          strokeWidth={sw}
          width={width}
          strokeLinecap="round"
        >
          <path d={linePath} className="stroke-klerosUIComponentsStroke" />
          {value && (
            <path
              className={clsx(
                "stroke-klerosUIComponentsSuccess",
                animated && "animate-progress-fill",
              )}
              width={(progress * width) / 100}
              // multiplying by a relatively large number to make sure filled part does not repeat
              strokeDasharray={`${(progress * width) / 100}, ${width * 1000}`}
              d={linePath}
            />
          )}
        </svg>
        {timerText && (
          <div
            className={clsx(
              "mt-1.25 flex items-center justify-center",
              "text-klerosUIComponentsError leading-4 font-semibold",
            )}
          >
            <HourglassIcon className="fill-klerosUIComponentsError mr-[9.75px]" />
            {timerText}
          </div>
        )}
      </div>
    </ProgressBar>
  );
}

export default Linear;
