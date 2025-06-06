import React from "react";
import SuccessIcon from "../../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../../assets/svgs/status-icons/info.svg";
import UpArrowIcon from "../../../assets/svgs/arrows/field-arrow-up.svg";
import DownArrowIcon from "../../../assets/svgs/arrows/field-arrow-down.svg";
import { cn } from "../../../utils";
import clsx from "clsx";
import { BigNumberFieldProps, useBigNumberField } from "./useBigNumberField";
import { Button, Group, Input } from "react-aria-components";

interface BigNumberFieldComponentProps extends BigNumberFieldProps {
  variant?: "success" | "warning" | "error" | "info";
  message?: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  className?: string;
  /** The name of the input element, used when submitting an HTML form.*/
  name?: string;
}

/** A number field that handles big numbers.
 * It allows a user to enter a number, and increment or decrement the value using stepper buttons. */
function BigNumberField({
  variant,
  message,
  Icon,
  className,
  placeholder,
  label,
  isDisabled,
  isReadOnly,
  name,
  ...props
}: Readonly<BigNumberFieldComponentProps>) {
  // Use our custom hook to get all the props and state
  const {
    inputProps,
    labelProps,
    incrementButtonProps,
    decrementButtonProps,
    groupProps,
    descriptionProps,
    errorMessageProps,
    validationResult,
  } = useBigNumberField({ isDisabled, placeholder, isReadOnly, ...props });

  return (
    <div className={cn("flex w-[278px] flex-col", className)}>
      {label && (
        <label
          {...labelProps}
          className="text-klerosUIComponentsSecondaryText mb-1 text-sm"
        >
          {label}
        </label>
      )}
      <Group
        {...groupProps}
        isDisabled={isDisabled || isReadOnly}
        className="input-wrapper relative box-border h-[45px] w-full"
      >
        {({ isHovered, isDisabled }) => (
          <>
            <Input
              {...inputProps}
              aria-errormessage="BigNumberFieldError"
              name={name}
              className={cn(
                "hover-short-transition bg-klerosUIComponentsWhiteBackground size-full",
                "rounded-base border-klerosUIComponentsStroke text-klerosUIComponentsPrimaryText border text-base",
                "placeholder:text-klerosUIComponentsSecondaryText placeholder:opacity-50",
                "focus:border-klerosUIComponentsPrimaryBlue focus:shadow-input focus:rounded-base focus:outline-none",
                "focus:invalid:border-klerosUIComponentsError focus:invalid:shadow-klerosUIComponentsError",
                !isDisabled && "hover-medium-blue",
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
            <div
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
                {...incrementButtonProps}
                excludeFromTabOrder
                className={clsx(
                  "rounded-base hover:bg-klerosUIComponentsStroke size-3.5 cursor-pointer border-none bg-transparent",
                  "flex items-center justify-center",
                  "disabled:cursor-default",
                )}
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
                {...decrementButtonProps}
                excludeFromTabOrder
                className={clsx(
                  "rounded-base hover:bg-klerosUIComponentsStroke size-3.5 cursor-pointer border-none bg-transparent",
                  "flex items-center justify-center",
                  "disabled:cursor-default",
                )}
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
            </div>
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
        <div
          {...(variant === "error" ? errorMessageProps : descriptionProps)}
          className={cn(
            "relative mt-1.25 flex items-center",
            "text-klerosUIComponentsSecondaryText text-justify text-sm break-words",
            {
              "text-klerosUIComponentsSuccess": variant === "success",
              "text-klerosUIComponentsError": variant === "error",
              "text-klerosUIComponentsWarning": variant === "warning",
            },
          )}
        >
          {variant === "info" && (
            <InfoIcon className="fill-klerosUIComponentsSecondaryText mr-2 max-w-4 min-w-4" />
          )}
          {message}
        </div>
      )}
      {props.showFieldError && validationResult.isInvalid && (
        <span
          id="BigNumberFieldError"
          aria-label={validationResult.validationError}
          className={cn(
            "text-klerosUIComponentsError mt-1 text-sm break-words",
            props.fieldErrorClassName,
          )}
        >
          {validationResult.validationError}
        </span>
      )}
    </div>
  );
}

export default BigNumberField;
