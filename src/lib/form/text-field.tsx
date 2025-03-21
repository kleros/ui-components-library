import React from "react";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";

import {
  TextField as AriaTextField,
  Input,
  type InputProps,
  Text,
  type TextFieldProps as AriaTextFieldProps,
  Label,
  Group,
} from "react-aria-components";
import { cn } from "../../utils";

interface TextFieldProps extends AriaTextFieldProps {
  variant?: "success" | "warning" | "error" | "info";
  message?: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  placeholder?: InputProps["placeholder"];
  /** Props for the input element.
   * [See InputProps](https://react-spectrum.adobe.com/react-aria/TextField.html#input)
   */
  inputProps?: InputProps;
  label?: string;
}
/** A text field allows a user to enter a plain text value with a keyboard. */
function TextField({
  variant,
  message,
  Icon,
  className,
  placeholder,
  label,
  ...props
}: Readonly<TextFieldProps>) {
  return (
    <AriaTextField
      className={cn("flex w-[278px] flex-col", className)}
      {...props}
    >
      {label && (
        <Label className="text-klerosUIComponentsSecondaryText mb-1 text-sm">
          {label}
        </Label>
      )}
      <Group className="relative box-border h-[45px] w-full">
        <Input
          placeholder={placeholder}
          {...props.inputProps}
          className={cn(
            "hover-medium-blue hover-short-transition bg-klerosUIComponentsWhiteBackground size-full",
            "rounded-base border-klerosUIComponentsStroke text-klerosUIComponentsPrimaryText border",
            "placeholder:text-klerosUIComponentsSecondaryText placeholder:opacity-50",
            "focus:border-klerosUIComponentsPrimaryBlue focus:shadow-input focus:rounded-base focus:outline-none",
            "focus:invalid:border-klerosUIComponentsError focus:invalid:shadow-klerosUIComponentsError",
            "px-4 py-3.5",
            { "pr-11": variant && variant !== "info", "pr-14": Icon },
            {
              "border-klerosUIComponentsWarning": variant === "warning",
              "border-klerosUIComponentsError": variant === "error",
              "border-klerosUIComponentsSuccess": variant === "success",
            },
            "invalid:border-klerosUIComponentsError",
            props.inputProps?.className,
          )}
        />
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
    </AriaTextField>
  );
}

export default TextField;
