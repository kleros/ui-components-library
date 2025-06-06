import React from "react";
import SearchIcon from "../../assets/svgs/form/search.svg";
import {
  FieldError,
  type FieldErrorProps,
  Group,
  Input,
  type InputProps,
  Label,
  SearchField,
  type SearchFieldProps,
} from "react-aria-components";
import { cn } from "../../utils";
import clsx from "clsx";

interface SearchbarProps extends SearchFieldProps {
  label?: string;
  placeholder?: string;
  /** Props for the input element.
   * [See InputProps](https://react-spectrum.adobe.com/react-aria/NumberField.html#input-1)
   */
  inputProps?: InputProps;
  /** Flag to enable field errors, alternative to `message`
   * This will show the validation errors from browser, or custom error in case `validate` is setup on Field.
   */
  showFieldError?: boolean;
  /** Props for FieldError in case `showFieldError` is true.
   * [See FieldErrorProps](https://react-spectrum.adobe.com/react-aria/SearchField.html#fielderror)
   */
  fieldErrorProps?: FieldErrorProps;
}
/** A search field allows a user to enter and clear a search query. */
function Searchbar({
  label,
  placeholder,
  inputProps,
  className,
  showFieldError,
  fieldErrorProps,
  ...props
}: Readonly<SearchbarProps>) {
  return (
    <SearchField className={cn("flex w-69.5 flex-col", className)} {...props}>
      {label && (
        <Label className="text-klerosUIComponentsSecondaryText mb-1 text-sm">
          {label}
        </Label>
      )}
      <Group className="relative box-border h-[45px] w-full">
        <Input
          placeholder={placeholder ?? "Search"}
          {...inputProps}
          className={cn(
            "hover-medium-blue hover-short-transition bg-klerosUIComponentsWhiteBackground size-full",
            "rounded-base border-klerosUIComponentsStroke text-klerosUIComponentsPrimaryText border text-base",
            "placeholder:text-klerosUIComponentsSecondaryText placeholder:opacity-50",
            "focus:border-klerosUIComponentsPrimaryBlue focus:shadow-input focus:rounded-base focus:outline-none",
            "focus:invalid:border-klerosUIComponentsError focus:invalid:shadow-klerosUIComponentsError",
            "py-3.5 pr-4 pl-10",
            "invalid:border-klerosUIComponentsError",
            "[&::-webkit-search-cancel-button]:hidden",
            inputProps?.className,
          )}
        />
        <SearchIcon
          className={clsx(
            "absolute top-1/2 left-4 -translate-y-1/2",
            "fill-klerosUIComponentsPrimaryText size-4 max-h-4 max-w-4",
          )}
        />
      </Group>
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
    </SearchField>
  );
}

export default Searchbar;
