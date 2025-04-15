import clsx from "clsx";
import React from "react";
import {
  Calendar as AriaCalender,
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
} from "react-aria-components";
import Arrow from "../../../assets/svgs/arrows/simple-left.svg";
import { cn } from "../../../utils";

const Calendar: React.FC = () => (
  <AriaCalender
    className="flex w-82.5 flex-col items-center"
    firstDayOfWeek="mon"
  >
    <header
      className={clsx(
        "flex h-16 w-full items-center justify-between p-6",
        "border-b-klerosUIComponentsStroke border-b",
      )}
    >
      <Button
        slot="previous"
        className={clsx(
          "focus:outline-klerosUIComponentsPrimaryBlue rounded-base focus:outline-offset-2",
          "cursor-pointer disabled:cursor-default",
        )}
      >
        {({ isDisabled, isHovered }) => (
          <Arrow
            className={cn(
              "fill-klerosUIComponentsPrimaryBlue ease-ease size-4 transition",
              isDisabled && "fill-klerosUIComponentsStroke",
              isHovered && "fill-klerosUIComponentsSecondaryBlue",
            )}
          />
        )}
      </Button>
      <Heading className="text-klerosUIComponentsPrimaryText text-base font-semibold select-none" />
      <Button
        slot="next"
        className="focus:outline-klerosUIComponentsPrimaryBlue rounded-base cursor-pointer focus:outline-offset-2"
      >
        {({ isHovered }) => (
          <Arrow
            className={cn(
              "ease-ease size-4 rotate-180 transition",
              "fill-klerosUIComponentsPrimaryBlue",
              isHovered && "fill-klerosUIComponentsSecondaryBlue",
            )}
          />
        )}
      </Button>
    </header>
    <CalendarGrid
      className={cn(
        "mt-4 mb-6",
        "border-separate border-spacing-x-1.75 border-spacing-y-0.5",
      )}
      weekdayStyle="short"
    >
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell
            className={clsx(
              "size-6 cursor-pointer pb-1",
              "text-klerosUIComponentsPrimaryText text-center text-sm font-semibold",
            )}
          >
            {day.substring(0, 2)}
          </CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => (
          <CalendarCell
            date={date}
            className={({ isFocused, isUnavailable, isDisabled, isSelected }) =>
              cn(
                "flex size-6 cursor-pointer items-center justify-center rounded-full",
                "text-klerosUIComponentsSecondaryText text-center text-sm font-semibold",
                "hover:bg-klerosUIComponentsSecondaryBlue hover:text-klerosUIComponentsWhiteBackground",
                "outside-month:hidden",
                isSelected && [
                  "bg-klerosUIComponentsPrimaryBlue text-klerosUIComponentsWhiteBackground",
                  "hover:bg-klerosUIComponentsPrimaryBlue",
                ],
                (isDisabled || isUnavailable) &&
                  "text-klerosUIComponentsStroke cursor-not-allowed",
                isFocused && [
                  "outline-klerosUIComponentsPrimaryBlue outline-2",
                ],
              )
            }
          >
            {date.day.toString().length === 1 ? `0${date.day}` : date.day}
          </CalendarCell>
        )}
      </CalendarGridBody>
    </CalendarGrid>
  </AriaCalender>
);

export default Calendar;
