import React from "react";
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

export interface IDropdownCascader extends AriaSelectProps {
  items: IItem[];
  /** Callback function passes the Item object as argument. */
  callback: (item: IItem) => void;
  label?: string;
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
  dropdownClassName,
  ...props
}: Readonly<IDropdownCascader>) {
  return (
    <AriaSelect
      className={cn("relative flex flex-col gap-1", className)}
      {...props}
      {...{ defaultSelectedKey, selectedKey, disabledKeys }}
      aria-label={label ?? "Select"}
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
          <DropdownButton {...{ placeholder }} />
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
