import React, { useContext } from "react";
import {
  Button,
  SelectStateContext,
  SelectValue,
  type ButtonProps,
} from "react-aria-components";
import clsx from "clsx";
import Arrow from "../../../assets/svgs/dropdown/arrow.svg";
import { cn } from "../../../utils";
import { IItem } from "./item";

const DropdownButton: React.FC<ButtonProps & { placeholder?: string }> = ({
  placeholder,
  ...props
}) => {
  const state = useContext(SelectStateContext);
  return (
    <Button
      className={cn(
        "bg-klerosUIComponentsWhiteBackground hover:bg-klerosUIComponentsMediumBlue",
        "hover-long-transition border-klerosUIComponentsStroke rounded-base box-border w-60 border",
        "flex items-center justify-between pr-4",
        "focus:shadow-input outline-none",
        "disabled:hover:bg-klerosUIComponentsWhiteBackground cursor-pointer disabled:cursor-not-allowed",
      )}
      {...props}
    >
      <SelectValue<IItem>>
        {({ isPlaceholder, selectedItem }) => (
          <div className="flex items-center py-[9.5px] pr-4 pl-3.25">
            <p
              className={clsx(
                "text-base",
                isPlaceholder || !selectedItem
                  ? "text-klerosUIComponentsSecondaryText"
                  : "text-klerosUIComponentsPrimaryText",
              )}
            >
              {isPlaceholder || !selectedItem
                ? (placeholder ?? "Select")
                : selectedItem.label}
            </p>
          </div>
        )}
      </SelectValue>
      <Arrow
        className={clsx(
          "hover-short-transition fill-klerosUIComponentsStroke ease-ease ml-2 size-4 transition",
          state?.isOpen && "rotate-180",
        )}
      />
    </Button>
  );
};

export default DropdownButton;
