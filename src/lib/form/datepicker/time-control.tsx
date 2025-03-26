import React from "react";
import { DateInput, DateSegment } from "react-aria-components";
import clsx from "clsx";
import { cn } from "../../../utils";
import ArrowButton, { ArrowButtonProps } from "./arrow-button";

interface ITimeControl {
  minValue: ArrowButtonProps["minValue"];
}
const TimeControl: React.FC<ITimeControl> = ({ minValue }) => {
  return (
    <div
      className="border-l-klerosUIComponentsStroke flex w-29.5 flex-col border-l"
      aria-label="time-selection"
    >
      <header className="border-b-klerosUIComponentsStroke flex h-16 items-center justify-center border-b">
        <h2 className="text-klerosUIComponentsPrimaryText text-base font-semibold">
          Time
        </h2>
      </header>
      <div role="group" className="flex grow flex-col">
        <div
          className={clsx(
            "h-16 w-full grow",
            "flex items-center justify-between px-6",
          )}
        >
          <ArrowButton arrowType="hour-increment" {...{ minValue }} />
          <ArrowButton arrowType="minute-increment" {...{ minValue }} />
        </div>
        <DateInput
          className={clsx(
            "bg-klerosUIComponentsMediumBlue h-16 w-full",
            "flex items-center justify-between px-6",
          )}
        >
          {({ type, ...segmentProps }) => (
            <>
              {["hour", "minute"].includes(type) ? (
                <DateSegment
                  segment={{ ...segmentProps, type }}
                  className={cn(
                    "text-klerosUIComponentsPrimaryBlue rounded-base text-base font-semibold",
                    "hover:text-klerosUIComponentsSecondaryBlue cursor-pointer",
                    "focus:outline-klerosUIComponentsPrimaryBlue focus:outline-offset-2",
                  )}
                />
              ) : null}
              {type === "hour" && (
                <span className="text-klerosUIComponentsPrimaryBlue px-1 text-base font-semibold">
                  :
                </span>
              )}
            </>
          )}
        </DateInput>
        <div
          className={clsx(
            "h-16 w-full grow",
            "flex items-center justify-between px-6",
          )}
        >
          <ArrowButton arrowType="hour-decrement" {...{ minValue }} />
          <ArrowButton arrowType="minute-decrement" {...{ minValue }} />
        </div>
      </div>
    </div>
  );
};

export default TimeControl;
