import clsx from "clsx";
import React, { useCallback, useRef } from "react";
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
import { SelectStateBridge, type SelectState } from "../select-state";
import { cn } from "../../../utils";

type SelectionMode = "single" | "multiple";

export interface SelectProps<M extends SelectionMode = "single">
  extends AriaSelectProps<object, M> {
  items: IItem[];
  /**
   * Callback function passes the Item object as argument. With
   * `selectionMode="multiple"`, it passes the selected Item objects, in the
   * order they were picked.
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

/** react-aria ignores the single-selection props in multiple selection. */
type MultipleSelectProps = Omit<
  SelectProps<"multiple">,
  "selectedKey" | "defaultSelectedKey" | "onSelectionChange"
> & { selectionMode: "multiple" };

// Overloads rather than a generic, so `ComponentProps<typeof DropdownSelect>`,
// which reads the last one, keeps resolving to the single-selection props. The
// docs read the first one, so single selection comes first too.
/**
 * A select displays a collapsible list of options and allows a user to select
 * one of them, or several with `selectionMode="multiple"`.
 */
function DropdownSelect(props: Readonly<SelectProps>): React.ReactElement;
/**
 * A select displays a collapsible list of options and allows a user to select
 * one of them, or several with `selectionMode="multiple"`.
 */
function DropdownSelect(
  props: Readonly<MultipleSelectProps>,
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
  const stateRef = useRef<SelectState | null>(null);

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
      // react-aria commits validation for picks in the list, but not for keys
      // pressed on the closed trigger, so a required field kept its error.
      stateRef.current?.commitValidation();
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
          <SelectStateBridge stateRef={stateRef} />
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
            matchTriggerWidth={!simpleButton}
          />
        </>
      )}
    </AriaSelect>
  );
}

export default DropdownSelect;
