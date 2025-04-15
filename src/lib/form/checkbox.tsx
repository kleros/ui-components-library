import React from "react";
import CheckmarkIcon from "../../assets/svgs/form/checkmark.svg";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { cn } from "../../utils";
import clsx from "clsx";

interface CheckboxProps extends AriaCheckboxProps {
  label: string;
  small?: boolean;
}

function Checkbox({
  small = false,
  label,
  className,
  ...props
}: Readonly<CheckboxProps>) {
  return (
    <AriaCheckbox
      className={cn(
        "relative box-border block cursor-pointer",
        "text-klerosUIComponentsPrimaryText",
        small ? "pl-7 text-base" : "pl-[35px] text-[22px]",
        className,
      )}
      {...props}
    >
      {({ isSelected }) => (
        <>
          {label}
          <div
            className={clsx(
              "absolute top-1 left-0",
              "rounded-base border-klerosUIComponentsStroke border",
              "overflow-hidden",
              small ? "size-4" : "size-6",
              isSelected &&
                "bg-klerosUIComponentsPrimaryBlue border-none after:block",
            )}
          >
            <CheckmarkIcon
              className={clsx(
                "absolute top-0.25 size-full",
                isSelected
                  ? "bg-klerosUIComponentsPrimaryBlue fill-klerosUIComponentsWhiteBackground animate-bounce-in"
                  : "fill-transparent",
                small ? "px-0.75" : "px-1",
              )}
            />
          </div>
        </>
      )}
    </AriaCheckbox>
  );
}

export default Checkbox;
