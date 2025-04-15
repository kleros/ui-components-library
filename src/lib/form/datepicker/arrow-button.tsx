import React, { useCallback, useContext } from "react";
import { Time } from "@internationalized/date";
import {
  Button,
  DatePickerStateContext,
  type ButtonProps,
  type DatePickerProps,
  type DateValue,
} from "react-aria-components";
import { cn } from "../../../utils";
import Arrow from "../../../assets/svgs/arrows/simple-left.svg";

export interface ArrowButtonProps extends ButtonProps {
  arrowType:
    | "hour-increment"
    | "hour-decrement"
    | "minute-increment"
    | "minute-decrement";
  minValue: DatePickerProps<DateValue>["minValue"];
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ arrowType, ...props }) => {
  const state = useContext(DatePickerStateContext);

  const handlePress = useCallback(() => {
    if (!state) return;
    if (!state.timeValue) {
      state.setTimeValue(new Time(0, 0));
    }
    const newTimeValue = state.timeValue ?? new Time(0, 0);
    switch (arrowType) {
      case "hour-increment":
        state.setTimeValue(newTimeValue.add({ hours: 1 }));
        break;
      case "minute-increment":
        state.setTimeValue(newTimeValue.add({ minutes: 1 }));
        break;
      case "hour-decrement":
        state.setTimeValue(newTimeValue.subtract({ hours: 1 }));
        break;
      case "minute-decrement":
        state.setTimeValue(newTimeValue.subtract({ minutes: 1 }));
        break;
      default:
        return;
    }
  }, [arrowType, state]);
  return (
    <Button
      className={({ isFocused }) =>
        cn(
          "rounded-base pressed:scale-95 ease-ease cursor-pointer transition",

          isFocused && "outline-klerosUIComponentsPrimaryBlue outline-offset-2",
        )
      }
      {...props}
      onPress={handlePress}
      aria-label={arrowType}
    >
      {({ isHovered }) => (
        <Arrow
          className={cn(
            "fill-klerosUIComponentsPrimaryBlue ease-ease size-4 transition",
            {
              "rotate-90":
                arrowType === "hour-increment" ||
                arrowType === "minute-increment",
              "-rotate-90":
                arrowType === "hour-decrement" ||
                arrowType === "minute-decrement",
            },
            isHovered && "fill-klerosUIComponentsSecondaryBlue",
          )}
        />
      )}
    </Button>
  );
};

export default ArrowButton;
