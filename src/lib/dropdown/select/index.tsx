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

interface SelectProps extends AriaSelectProps {
  items: IItem[];
  /** Callback function passes the Item object as argument. */
  callback: (value: IItem) => void;
  simpleButton?: boolean;
  /** When `simpleButton` is `true`, this scales down the dropdown button size. */
  smallButton?: boolean;
  label?: string;
}

/** A select displays a collapsible list of options and allows a user to select one of them. */
function DropdownSelect({
  label,
  smallButton,
  simpleButton,
  items,
  callback,
  placeholder,
  className,
  ...props
}: Readonly<SelectProps>) {
  const handleSelection = useCallback(
    (selectedKey: Key) => {
      const selectedItem = items.find((item) => item.id === selectedKey);
      if (selectedItem) callback(selectedItem);
    },
    [items, callback],
  );

  return (
    <AriaSelect
      className={cn("flex flex-col gap-1", className)}
      {...props}
      onSelectionChange={handleSelection}
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
          {simpleButton ? (
            <SimpleButton {...{ isOpen, placeholder }} small={smallButton} />
          ) : (
            <DropdownButton {...{ placeholder }} />
          )}
          <FieldError className="text-klerosUIComponentsError text-sm" />
          <DropdownContainer {...{ isOpen, items }} />
        </>
      )}
    </AriaSelect>
  );
}

export default DropdownSelect;
