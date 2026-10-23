import React, { useRef } from "react";
import {
  Select as AriaSelect,
  FieldError,
  Label,
  type SelectProps as AriaSelectProps,
} from "react-aria-components";
import clsx from "clsx";
import DropdownContainer from "./dropdown-container";
import { cn } from "../../../utils";
import { IItem } from "./item";
import DropdownButton from "./button";
import { SelectStateBridge, type SelectState } from "../select-state";

export interface IDropdownCascader extends AriaSelectProps {
  items: IItem[];
  /** Callback function passes the Item object as argument. */
  callback: (item: IItem) => void;
  label?: string;
  /** Classes for the trigger button, merged over its own, e.g. `w-full`. `className` styles the outer wrapper. */
  buttonClassName?: string;
  dropdownClassName?: string;
}

/** A Dropdown Cascader provides users with a way to navigate nested hierarchical information,
 *  with support for keyboard navigation and selection. */
function DropdownCascader({
  label,
  items,
  callback,
  placeholder,
  className,
  disabledKeys,
  selectedKey,
  defaultSelectedKey,
  buttonClassName,
  dropdownClassName,
  onChange,
  "aria-label": ariaLabel,
  ...props
}: Readonly<IDropdownCascader>) {
  const stateRef = useRef<SelectState | null>(null);

  return (
    <AriaSelect
      className={cn("relative flex flex-col gap-1", className)}
      {...props}
      {...{ defaultSelectedKey, selectedKey, disabledKeys }}
      onChange={(value) => {
        onChange?.(value);
        // react-aria doesn't commit validation when the selection is set through
        // its state, as the Select button and keys on the closed trigger do, so
        // a required field kept its error after a valid pick.
        stateRef.current?.commitValidation();
      }}
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
          <DropdownButton {...{ placeholder }} className={buttonClassName} />
          <FieldError className="text-klerosUIComponentsError text-sm" />
          <DropdownContainer
            {...{
              isOpen,
              items,
              defaultSelectedKey: selectedKey ?? defaultSelectedKey,
              disabledKeys,
              callback,
              className: dropdownClassName,
            }}
          />
        </>
      )}
    </AriaSelect>
  );
}

export default DropdownCascader;
