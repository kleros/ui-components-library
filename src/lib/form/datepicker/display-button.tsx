import React, { useCallback, useContext } from "react";

import {
  Button,
  DateInput,
  DatePickerStateContext,
  DateSegment,
  Group,
} from "react-aria-components";
import CalendarIcon from "../../../assets/svgs/form/calendar.svg";
import { cn } from "../../../utils";

const DisplayButton: React.FC = () => {
  const state = useContext(DatePickerStateContext);
  const openPopup = useCallback(() => {
    if (state) state.open();
  }, [state]);
  return (
    <Group
      className={cn(
        "hover-medium-blue hover-long-transition bg-klerosUIComponentsWhiteBackground cursor-pointer",
        "border-klerosUIComponentsStroke rounded-base h-11.25 w-82.5 border px-4",
        "relative flex items-center justify-start",
        "invalid:border-klerosUIComponentsError",
      )}
      onClick={openPopup}
    >
      <DateInput>
        {(segment) => (
          <DateSegment
            className={({ isPlaceholder }) =>
              cn(
                "text-klerosUIComponentsPrimaryText cursor-pointer px-0.5",
                isPlaceholder && "text-klerosUIComponentsSecondaryText",
                "focus:text-klerosUIComponentsSecondaryBlue focus:outline-none",
                "type-literal:px-0",
                "data-[type=timeZoneName]:focus:text-klerosUIComponentsPrimaryText",
              )
            }
            segment={segment}
          />
        )}
      </DateInput>
      <Button className="absolute right-4 size-4 cursor-pointer focus:outline-none">
        {({ isFocused }) => (
          <CalendarIcon
            className={cn(
              "fill-klerosUIComponentsStroke hover:fill-klerosUIComponentsPrimaryBlue",
              "transition",
              isFocused && "fill-klerosUIComponentsPrimaryBlue",
            )}
          />
        )}
      </Button>
    </Group>
  );
};

export default DisplayButton;
