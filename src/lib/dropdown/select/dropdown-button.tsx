import React, { useContext } from "react";
import {
  Button,
  SelectStateContext,
  SelectValue,
  type SelectValueRenderProps,
  type ButtonProps,
} from "react-aria-components";
import { IItem } from "./item";
import Dot from "../../dot";
import Arrow from "../../../assets/svgs/dropdown/arrow.svg";
import { cn } from "../../../utils";
import clsx from "clsx";

const ItemDisplayContainer: React.FC<
  SelectValueRenderProps<IItem> & { placeholder?: string }
> = ({ placeholder, isPlaceholder, selectedItems, selectedText }) => {
  const [selectedItem] = selectedItems;
  if (isPlaceholder || !selectedItem)
    return (
      <div className="flex items-center py-[9.5px] pr-4 pl-3.25">
        <p className="text-klerosUIComponentsSecondaryText truncate text-base">
          {placeholder ?? "Select"}
        </p>
      </div>
    );
  // several items picked in multiple selection: their texts as a list
  if (selectedItems.length > 1)
    return (
      <div className="flex items-center py-[9.5px] pr-4 pl-3.25">
        <p className="text-klerosUIComponentsPrimaryText truncate text-base">
          {selectedText}
        </p>
      </div>
    );
  const { Icon, icon, text, dot } = selectedItem;
  return (
    <div className="flex items-center py-[9.5px] pr-4 pl-3.25">
      {icon ??
        (Icon && <Icon className="max-h-4 min-h-3 max-w-4 min-w-3 shrink-0" />)}
      {dot && <Dot className="mr-2 shrink-0" color={dot} />}
      <p className="text-klerosUIComponentsPrimaryText truncate text-base">
        {text}
      </p>
    </div>
  );
};

const DropdownButton: React.FC<
  Omit<ButtonProps, "className"> & { placeholder?: string; className?: string }
> = ({ placeholder, className, ...props }) => {
  const state = useContext(SelectStateContext);

  return (
    <Button
      className={cn(
        "bg-klerosUIComponentsWhiteBackground hover:bg-klerosUIComponentsMediumBlue",
        "hover-long-transition border-klerosUIComponentsStroke rounded-base box-border w-60 max-w-full border",
        "flex items-center justify-between pr-4",
        "focus:shadow-input outline-none",
        "disabled:hover:bg-klerosUIComponentsWhiteBackground cursor-pointer disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {/* min-w-0 lets the value shrink, so long text truncates inside the button */}
      <SelectValue<IItem>
        className={({ defaultClassName }) => clsx(defaultClassName, "min-w-0")}
      >
        {(props) => (
          <ItemDisplayContainer {...props} placeholder={placeholder} />
        )}
      </SelectValue>
      <Arrow
        className={clsx(
          "hover-short-transition fill-klerosUIComponentsStroke ease-ease ml-2 size-4 shrink-0 transition",
          state?.isOpen && "rotate-180",
        )}
      />
    </Button>
  );
};

export default DropdownButton;
