import React, { useMemo } from "react";
import { ProgressBar, type ProgressBarProps } from "react-aria-components";
import clsx from "clsx";

interface CircularProps
  extends Omit<
    ProgressBarProps,
    "isIndeterminate" | "valueLabel" | "formatOptions"
  > {
  small?: boolean;
  /** Provides the current progress value.
   * When minValue and maxValue are not defined, it represents the percentage value between 0-100%. */
  value: number;
  /** Whether the progress bas should animate to it's value. */
  animated?: boolean;
}

/** Circular progress shows determinate progress of an operation over time in a circular way.*/
function Circular({
  value,
  minValue = 0,
  maxValue = 100,
  small = false,
  animated = true,
  ...props
}: Readonly<CircularProps>) {
  const progress = useMemo(
    () => (value / (maxValue - minValue)) * 100,
    [value, minValue, maxValue],
  );

  const width = small ? 80 : 120;
  const sw = width / 20; // stroke-width
  const rad = (width - sw) / 2 + 1;
  const dy = width - sw + 2;
  const circ = 2 * Math.PI * rad;

  const circlePath = `M ${(width + sw) / 2} ${sw / 2}
  a ${rad} ${rad} 0 0 1 0 ${dy}
  a ${rad} ${rad} 0 0 1 0 -${dy}`;

  return (
    <ProgressBar
      {...props}
      {...{ value, minValue, maxValue }}
      aria-label={progress.toString()}
    >
      <svg
        className="mx-auto my-2.5 box-border block"
        fill="none"
        strokeWidth={sw}
        strokeLinecap="round"
        width={width + sw}
        height={width + sw}
      >
        <path className="stroke-klerosUIComponentsStroke" d={circlePath} />
        {progress && (
          <path
            className={clsx(
              progress < 100
                ? "stroke-klerosUIComponentsPrimaryBlue"
                : "stroke-klerosUIComponentsSuccess",
              animated && "animate-progress-fill",
            )}
            // multiplying by a relatively large number to make sure filled part does not repeat
            strokeDasharray={`${(progress * circ) / 100}, ${circ * 1000}`}
            d={circlePath}
          />
        )}
        <text
          className="fill-klerosUIComponentsPrimaryText"
          fontSize={small ? 16 : 24}
          fontWeight={600}
          textAnchor="middle"
          dominantBaseline="middle"
          x="50%"
          y="50%"
        >
          {progress}%
        </text>
      </svg>
    </ProgressBar>
  );
}

export default Circular;
