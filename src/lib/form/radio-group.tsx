import React from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  FieldError,
  type FieldErrorProps,
  Label,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from "react-aria-components";
import { cn } from "../../utils";
import clsx from "clsx";

interface RadioOption extends AriaRadioProps {
  label: string;
}

interface RadioGroupProps extends AriaRadioGroupProps {
  groupLabel?: string;
  small?: boolean;
  /** Items to be rendered as options.
   * [Extends AriaRadioProps](https://react-spectrum.adobe.com/react-aria/RadioGroup.html#radiogroup-1)
   */
  options: RadioOption[];
  /** Props for field error display
   * [See FieldErrorProps](https://react-spectrum.adobe.com/react-aria/RadioGroup.html#fielderror)
   */
  fieldErrorProps?: FieldErrorProps;
}

/** A radio group allows a user to select a single item from a list of mutually exclusive options.
 * [Extends AriaRadioGroupProps](https://react-spectrum.adobe.com/react-aria/RadioGroup.html#radiogroup-1)
 */
function RadioGroup({
  small = false,
  groupLabel,
  options,
  className,
  fieldErrorProps,
  ...props
}: Readonly<RadioGroupProps>) {
  return (
    <AriaRadioGroup
      {...props}
      className={cn(
        "relative flex flex-col gap-2",
        "orientation-horizontal:flex-row orientation-horizontal:items-center orientation-horizontal:gap-4",
        "orientation-horizontal:[&>span]:mr-2 orientation-vertical:[&>span]:mb-1",
        className,
      )}
    >
      {groupLabel && (
        <Label
          className={clsx(
            "text-klerosUIComponentsSecondaryText",
            small ? "text-sm" : "text-lg",
          )}
        >
          {groupLabel}
        </Label>
      )}
      {options.map((option) => (
        <AriaRadio
          key={option.value}
          {...option}
          className={cn(
            "relative box-border block cursor-pointer",
            "text-klerosUIComponentsPrimaryText disabled:text-klerosUIComponentsStroke",
            small ? "pl-7 text-base" : "pl-[35px] text-[22px]",
            option.className,
          )}
        >
          {({ isSelected, isHovered, isDisabled, isPressed }) => (
            <>
              <span
                className={cn(
                  "border-klerosUIComponentsStroke absolute top-1 left-0 rounded-full border",
                  "after:bg-klerosUIComponentsPrimaryBlue after:absolute after:hidden after:rounded-full",
                  "ease-ease after:ease-ease transition-all after:transition-all",
                  small
                    ? "size-4 after:top-0.75 after:left-0.75 after:size-2"
                    : "size-6 after:top-1.25 after:left-1.25 after:size-3",
                  isSelected && [
                    "bg-klerosUIComponentsWhiteBackground border-klerosUIComponentsPrimaryBlue after:block",
                  ],
                  isHovered && [
                    "border-klerosUIComponentsSecondaryBlue bg-klerosUIComponentsLightBlue",
                  ],
                  isPressed && [
                    "border-klerosUIComponentsSecondaryBlue after:bg-klerosUIComponentsSecondaryBlue",
                  ],
                  isDisabled && [
                    "border-klerosUIComponentsStroke after:hidden",
                  ],
                )}
              />
              {option.label}
            </>
          )}
        </AriaRadio>
      ))}
      <FieldError
        {...fieldErrorProps}
        className={cn(
          "text-klerosUIComponentsError self-end text-sm",
          fieldErrorProps?.className,
        )}
      />
    </AriaRadioGroup>
  );
}

export default RadioGroup;
