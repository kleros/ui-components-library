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
  /** Ignored, as it always has been: use `defaultSelectedKey`. */
  defaultValue?: AriaSelectProps["defaultValue"];
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
      // react-aria 1.7.1 ignored defaultValue, and an app that passes one still
      // expects that; defaultSelectedKey sets the default.
      defaultValue={undefined}
      {...{ defaultSelectedKey, selectedKey, disabledKeys }}
      onChange={(value) => {
        onChange?.(value);
        // react-aria doesn't commit validation when the selection is set through
        // its state, as the Select button and keys on the closed trigger do, so
        // a required field kept its error after a valid pick. A form reset also
        // sets the value; react-aria handles validation there.
        if (window.event?.type !== "reset")
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
