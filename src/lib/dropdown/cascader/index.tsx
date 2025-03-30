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
  ...props
}: Readonly<IDropdownCascader>) {
  return (
    <AriaSelect
      className={cn("relative flex flex-col gap-1", className)}
      {...props}
      {...{ defaultSelectedKey, selectedKey, disabledKeys }}
    >
      {({ isOpen }) => (
        <>
          <Label className={clsx("text-klerosUIComponentsPrimaryText text-sm")}>
            {label}
          </Label>
          <DropdownButton {...{ placeholder }} />
          <FieldError className="text-klerosUIComponentsError text-sm" />
          <DropdownContainer
            {...{
              isOpen,
              items,
              defaultSelectedKey: selectedKey ?? defaultSelectedKey,
              disabledKeys,
              callback,
            }}
          />
        </>
      )}
    </AriaSelect>
  );
}

export default DropdownCascader;
