import React from "react";
import {
  Button,
  DatePicker as AriaDatePicker,
  Dialog,
  Label,
  Popover,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
  FieldError,
} from "react-aria-components";
import CustomButton from "../../button";
import clsx from "clsx";
import DisplayButton from "./display-button";
import TimeControl from "./time-control";
import Calendar from "./calendar";
import { getLocalTimeZone, now } from "@internationalized/date";
import { cn } from "../../../utils";

interface DatePickerProps
  extends Omit<
    AriaDatePickerProps<DateValue>,
    "granularity" | "hourCycle" | "firstDayOfWeek"
  > {
  /** Show time selection if true. */
  time?: boolean;
  label?: string;
  popoverClassName?: string;
}

/** A date picker allow users to enter or select a date and time value. */
function DatePicker({
  label,
  time = false,
  minValue,
  defaultValue = now(getLocalTimeZone()),
  shouldCloseOnSelect = false,
  popoverClassName,
  ...props
}: Readonly<DatePickerProps>) {
  return (
    <AriaDatePicker
      {...props}
      {...{ shouldCloseOnSelect, minValue, defaultValue }}
      granularity={time ? "minute" : "day"}
      hourCycle={24}
    >
      {({ state }) => (
        <>
          <Label
            className={cn(
              "text-klerosUIComponentsPrimaryText mb-1 text-base",
              !label && "hidden",
            )}
          >
            {label ?? "Date"}
          </Label>

          <DisplayButton />
          <FieldError className="text-klerosUIComponentsError mt-1 text-sm" />

          <Popover
            className={clsx(
              "bg-klerosUIComponentsWhiteBackground shadow-default rounded-base overflow-y-scroll",
              "border-klerosUIComponentsStroke ease-ease scrollbar border transition",
              time ? "w-82.5 lg:w-112.5" : "w-82.5",
              popoverClassName,
            )}
          >
            <Dialog className="flex size-full flex-wrap">
              <Calendar />
              {time && <TimeControl {...{ minValue }} />}
              <div
                className={clsx(
                  "flex h-16 w-full items-center justify-between px-4",
                  "border-t-klerosUIComponentsStroke border-t",
                )}
              >
                <Button
                  className={clsx(
                    "text-klerosUIComponentsPrimaryBlue rounded-base text-sm font-semibold",
                    "hover:text-klerosUIComponentsSecondaryBlue hover:cursor-pointer",
                    "focus:outline-klerosUIComponentsPrimaryBlue focus:outline-offset-8",
                  )}
                  onPress={() => state.setValue(defaultValue)}
                >
                  Clear
                </Button>
                <CustomButton
                  small
                  text="Select"
                  onPress={() => state.close()}
                  className="focus:outline-klerosUIComponentsPrimaryBlue cursor-pointer focus:outline-offset-2"
                />
              </div>
            </Dialog>
          </Popover>
        </>
      )}
    </AriaDatePicker>
  );
}

export default DatePicker;
