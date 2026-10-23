import clsx from "clsx";
import React, { useCallback } from "react";
import {
  Select as AriaSelect,
  FieldError,
  Label,
  type Key,
  type SelectProps as AriaSelectProps,
} from "react-aria-components";
import SimpleButton from "./simple-button";
import { IItem } from "./item";
import DropdownButton from "./dropdown-button";
import DropdownContainer from "./dropdown-container";
import { cn } from "../../../utils";

type SelectionMode = "single" | "multiple";

export interface SelectProps<M extends SelectionMode = "single">
  extends AriaSelectProps<object, M> {
  items: IItem[];
  /**
   * Callback function passes the Item object as argument. With
   * `selectionMode="multiple"`, it passes the selected Item objects.
   */
  callback: (value: M extends "multiple" ? IItem[] : IItem) => void;
  simpleButton?: boolean;
  /** When `simpleButton` is `true`, this scales down the dropdown button size. */
  smallButton?: boolean;
  label?: string;
  /** Classes for the trigger button, merged over its own, e.g. `w-full`. `className` styles the outer wrapper. */
  buttonClassName?: string;
  dropdownClassName?: string;
}

// Overloads rather than a generic, so `ComponentProps<typeof DropdownSelect>`
// keeps resolving to the single-selection props, with `callback` taking one item.
/**
 * A select displays a collapsible list of options and allows a user to select
 * one of them, or several with `selectionMode="multiple"`.
 */
function DropdownSelect(
  props: Readonly<SelectProps<"multiple"> & { selectionMode: "multiple" }>,
): React.ReactElement;
/**
 * A select displays a collapsible list of options and allows a user to select
 * one of them, or several with `selectionMode="multiple"`.
 */
function DropdownSelect(props: Readonly<SelectProps>): React.ReactElement;
function DropdownSelect({
  label,
  smallButton,
  simpleButton,
  items,
  callback,
  placeholder,
  className,
  buttonClassName,
  dropdownClassName,
  onSelectionChange,
  onChange,
  "aria-label": ariaLabel,
  ...props
}: Readonly<SelectProps | SelectProps<"multiple">>) {
  const handleSelection = useCallback(
    (selectedKey: Key | null) => {
      onSelectionChange?.(selectedKey);
      const selectedItem = items.find((item) => item.id === selectedKey);
      if (selectedItem) (callback as (item: IItem) => void)(selectedItem);
    },
    [items, callback, onSelectionChange],
  );

  // With multiple selection, react-aria calls only onChange, with every
  // selected key.
  const handleChange = useCallback(
    (value: Key | Key[] | null) => {
      (onChange as ((value: Key | Key[] | null) => void) | undefined)?.(value);
      if (Array.isArray(value))
        (callback as (items: IItem[]) => void)(
          value.flatMap((key) => items.filter((item) => item.id === key)),
        );
    },
    [items, callback, onChange],
  );

  return (
    <AriaSelect<object, SelectionMode>
      className={cn("flex flex-col gap-1", className)}
      {...props}
      onSelectionChange={handleSelection}
      onChange={handleChange}
      aria-label={
        ariaLabel ?? (label || props["aria-labelledby"] ? undefined : "Select")
      }
    >
      {({ isOpen }) => (
        <>
          {label && (
            <Label
              className={clsx("text-klerosUIComponentsPrimaryText text-sm")}
            >
              {label}
            </Label>
          )}
          {simpleButton ? (
            <SimpleButton
              {...{ isOpen, placeholder }}
              small={smallButton}
              className={buttonClassName}
            />
          ) : (
            <DropdownButton {...{ placeholder }} className={buttonClassName} />
          )}
          <FieldError className="text-klerosUIComponentsError text-sm" />
          <DropdownContainer
            {...{ isOpen, items, className: dropdownClassName }}
          />
        </>
      )}
    </AriaSelect>
  );
}

export default DropdownSelect;
