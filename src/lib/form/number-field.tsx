import React from "react";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";
import UpArrowIcon from "../../assets/svgs/arrows/field-arrow-up.svg";
import DownArrowIcon from "../../assets/svgs/arrows/field-arrow-down.svg";

import {
  NumberField as AriaNumberField,
  Button,
  Group,
  Input,
  type InputProps,
  type NumberFieldProps as AriaNumberFieldProps,
  Label,
  Text,
  type FieldErrorProps,
  FieldError,
} from "react-aria-components";
import { cn } from "../../utils";
import clsx from "clsx";

interface NumberFieldProps extends AriaNumberFieldProps {
  variant?: "success" | "warning" | "error" | "info";
  message?: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  placeholder?: InputProps["placeholder"];
  /** Props for the input element.
   * [See InputProps](https://react-spectrum.adobe.com/react-aria/NumberField.html#input-1)
   */
  inputProps?: InputProps;
  label?: string;
  /** Flag to enable field errors, alternative to `message`
   * This will show the validation errors from browser, or custom error in case `validate` is setup on Field.
   */
  showFieldError?: boolean;
  /** Props for FieldError in case `showFieldError` is true.
   * [See FieldErrorProps](https://react-spectrum.adobe.com/react-aria/NumberField.html#fielderror)
   */
  fieldErrorProps?: FieldErrorProps;
}

/** A number field allows a user to enter a number, and increment or decrement the value using stepper buttons. */
function NumberField({
  variant,
  message,
  Icon,
  className,
  placeholder,
  label,
  isDisabled,
  inputProps,
  showFieldError,
  fieldErrorProps,
  ...props
}: Readonly<NumberFieldProps>) {
  return (
    <AriaNumberField
      className={cn("flex w-[278px] flex-col", className)}
      isDisabled={isDisabled}
      {...props}
    >
      {label && (
        <Label className="text-klerosUIComponentsSecondaryText mb-1 text-sm">
          {label}
        </Label>
      )}
      <Group className="input-wrapper relative box-border h-[45px] w-full">
        {({ isHovered }) => (
          <>
            <Input
              placeholder={placeholder}
              {...inputProps}
              className={cn(
                "hover-medium-blue hover-short-transition bg-klerosUIComponentsWhiteBackground size-full",
                "rounded-base border-klerosUIComponentsStroke text-klerosUIComponentsPrimaryText border text-base",
                "placeholder:text-klerosUIComponentsSecondaryText placeholder:opacity-50",
                "focus:border-klerosUIComponentsPrimaryBlue focus:shadow-input focus:rounded-base focus:outline-none",
                "focus:invalid:border-klerosUIComponentsError focus:invalid:shadow-klerosUIComponentsError",
                "py-3.5 pr-7.5 pl-4",
                { "pr-13": variant && variant !== "info", "pr-16": Icon },
                {
                  "border-klerosUIComponentsWarning": variant === "warning",
                  "border-klerosUIComponentsError": variant === "error",
                  "border-klerosUIComponentsSuccess": variant === "success",
                },
                "invalid:border-klerosUIComponentsError",
                inputProps?.className,
              )}
            />
            <Group
              className={cn(
                "animate-fade-in absolute top-0 right-3 hidden h-full w-3.5",
                isHovered &&
                  !isDisabled &&
                  "flex flex-col items-center justify-center gap-1",
                {
                  "right-9": variant && variant !== "info",
                  "right-12": Icon,
                },
              )}
            >
              <Button
                className={clsx(
                  "rounded-base hover:bg-klerosUIComponentsStroke size-3.5 cursor-pointer border-none bg-transparent",
                  "flex items-center justify-center",
                  "disabled:cursor-default",
                )}
                slot="increment"
              >
                {({ isDisabled }) => (
                  <UpArrowIcon
                    className={clsx(
                      "size-2",
                      isDisabled
                        ? "[&_path]:fill-klerosUIComponentsStroke"
                        : "[&_path]:fill-klerosUIComponentsSecondaryText",
                    )}
                  />
                )}
              </Button>
              <Button
                className={clsx(
                  "rounded-base hover:bg-klerosUIComponentsStroke size-3.5 cursor-pointer border-none bg-transparent",
                  "flex items-center justify-center",
                  "disabled:cursor-default",
                )}
                slot="decrement"
              >
                {({ isDisabled }) => (
                  <DownArrowIcon
                    className={clsx(
                      "size-2",
                      isDisabled
                        ? "[&_path]:fill-klerosUIComponentsStroke"
                        : "[&_path]:fill-klerosUIComponentsSecondaryText",
                    )}
                  />
                )}
              </Button>
            </Group>
            {variant === "success" && (
              <SuccessIcon className="fill-klerosUIComponentsSuccess absolute top-3.5 right-4 size-4" />
            )}
            {variant === "warning" && (
              <WarningIcon className="fill-klerosUIComponentsWarning absolute top-3.5 right-4 size-4" />
            )}
            {variant === "error" && (
              <ErrorIcon className="fill-klerosUIComponentsError absolute top-3.5 right-4 size-4" />
            )}
            {Icon && (
              <div
                className={cn(
                  "bg-klerosUIComponentsLightBlue absolute top-0.25 right-0.25 h-10.75 w-11",
                  "border-l-klerosUIComponentsStroke rounded-r-base border-l",
                  "flex items-center justify-center",
                )}
              >
                <Icon className="size-6" />
              </div>
            )}
          </>
        )}
      </Group>
      {message && (
        <Text
          className={cn(
            "relative mt-1.25 flex items-center",
            "text-klerosUIComponentsSecondaryText text-justify text-sm break-words",
            {
              "text-klerosUIComponentsSuccess": variant === "success",
              "text-klerosUIComponentsError": variant === "error",
              "text-klerosUIComponentsWarning": variant === "warning",
            },
          )}
          slot="description"
        >
          {variant === "info" && (
            <InfoIcon className="fill-klerosUIComponentsSecondaryText mr-2 max-w-4 min-w-4" />
          )}
          {message}
        </Text>
      )}

      {showFieldError && (
        <FieldError
          {...fieldErrorProps}
          className={cn(
            "text-klerosUIComponentsError mt-1 text-sm break-words",
            fieldErrorProps?.className,
          )}
        >
          {fieldErrorProps?.children}
        </FieldError>
      )}
    </AriaNumberField>
  );
}

export default NumberField;
