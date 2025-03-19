import React from "react";
import CheckmarkIcon from "../../assets/svgs/form/checkmark.svg";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { cn } from "../../utils";
import clsx from "clsx";
interface CheckboxBaseProps {
  checked?: boolean;
  small?: boolean;
}

interface CheckboxProps extends CheckboxBaseProps, AriaCheckboxProps {
  label: string;
}

function Checkbox({
  small = false,
  checked,
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
      {label}
      <div
        className={clsx(
          "absolute top-1 left-0",
          "rounded-base border-klerosUIComponentsStroke border",
          "overflow-hidden",
          small ? "h-4 w-4" : "h-6 w-6",
          checked && "bg-klerosUIComponentsPrimaryBlue border-none after:block",
        )}
      >
        <CheckmarkIcon
          className={clsx(
            "absolute top-0.25 h-full w-full",
            checked
              ? "bg-klerosUIComponentsPrimaryBlue fill-klerosUIComponentsWhiteBackground animate-bounce-in"
              : "fill-transparent",
            small ? "px-0.75" : "px-1",
          )}
        />
      </div>
    </AriaCheckbox>
  );
}

export default Checkbox;
