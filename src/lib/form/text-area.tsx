import React from "react";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";

import {
  type InputProps,
  Label,
  TextArea as AriaTextArea,
  TextField,
  type TextFieldProps,
  type TextAreaProps as AriaTextAreaProps,
  Text,
} from "react-aria-components";
import { cn } from "../../utils";

interface TextAreaProps extends TextFieldProps {
  variant?: "success" | "warning" | "error" | "info";
  message?: string;
  placeholder?: InputProps["placeholder"];
  /** Props for the input element.
   * [See AriaTextAreaProps](https://react-spectrum.adobe.com/react-aria/TextField.html#textarea-1)
   */
  inputProps?: AriaTextAreaProps;
  label?: string;
  /** Allow resizing along x-axis */
  resizeX?: boolean;
  /** Allow resizing along y-axis */
  resizeY?: boolean;
}

/** TextArea components supports multiline input and can be configured to resize. */
function TextArea({
  message,
  variant,
  className,
  label,
  placeholder,
  resizeX = false,
  resizeY = false,
  ...props
}: Readonly<TextAreaProps>) {
  return (
    <TextField
      className={cn("box-border flex w-fit flex-col", className)}
      {...props}
    >
      {label && (
        <Label className="text-klerosUIComponentsSecondaryText mb-1 text-sm">
          {label}
        </Label>
      )}
      <AriaTextArea
        placeholder={placeholder}
        {...props.inputProps}
        className={cn(
          "hover-medium-blue bg-klerosUIComponentsWhiteBackground resize-none",
          "relative box-border block h-28.75 w-100 p-4",
          "rounded-base border-klerosUIComponentsStroke text-klerosUIComponentsPrimaryText border text-base",
          "placeholder:text-klerosUIComponentsSecondaryText placeholder:opacity-50",
          "focus:border-klerosUIComponentsPrimaryBlue focus:shadow-input focus:rounded-base focus:outline-none",
          "focus:invalid:border-klerosUIComponentsError focus:invalid:shadow-klerosUIComponentsError",
          {
            "border-klerosUIComponentsWarning": variant === "warning",
            "border-klerosUIComponentsError": variant === "error",
            "border-klerosUIComponentsSuccess": variant === "success",
          },
          "invalid:border-klerosUIComponentsError",
          resizeX && "resize-x",
          resizeY && "resize-y",
          resizeX && resizeY && "resize",
          props.inputProps?.className,
        )}
      />
      {message && (
        <Text
          slot="description"
          className={cn(
            "relative mt-3 flex items-center",
            "text-klerosUIComponentsSecondaryText text-justify text-sm break-words",
            {
              "text-klerosUIComponentsSuccess": variant === "success",
              "text-klerosUIComponentsError": variant === "error",
              "text-klerosUIComponentsWarning": variant === "warning",
            },
          )}
        >
          {variant === "success" && (
            <SuccessIcon className="fill-klerosUIComponentsSuccess mr-2 max-w-4 min-w-4" />
          )}
          {variant === "warning" && (
            <WarningIcon className="fill-klerosUIComponentsWarning mr-2 max-w-4 min-w-4" />
          )}
          {variant === "error" && (
            <ErrorIcon className="fill-klerosUIComponentsError mr-2 max-w-4 min-w-4" />
          )}
          {variant === "info" && (
            <InfoIcon className="fill-klerosUIComponentsSecondaryText mr-2 max-w-4 min-w-4" />
          )}
          {message}
        </Text>
      )}
    </TextField>
  );
}

export default TextArea;
