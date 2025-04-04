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
> = ({ placeholder, isPlaceholder, selectedItem }) => {
  if (isPlaceholder || !selectedItem)
    return (
      <div className="flex items-center py-[9.5px] pr-4 pl-3.25">
        <p className="text-klerosUIComponentsSecondaryText text-base">
          {placeholder ?? "Select"}
        </p>
      </div>
    );
  const { Icon, icon, text, dot } = selectedItem;
  return (
    <div className="flex items-center py-[9.5px] pr-4 pl-3.25">
      {icon ?? (Icon && <Icon className="max-h-4 min-h-3 max-w-4 min-w-3" />)}
      {dot && <Dot className="mr-2" color={dot} />}
      <p className="text-klerosUIComponentsPrimaryText text-base">{text}</p>
    </div>
  );
};

const DropdownButton: React.FC<ButtonProps & { placeholder?: string }> = ({
  placeholder,
  ...props
}) => {
  const state = useContext(SelectStateContext);

  return (
    <Button
      className={cn(
        "bg-klerosUIComponentsWhiteBackground hover:bg-klerosUIComponentsMediumBlue",
        "hover-long-transition border-klerosUIComponentsStroke rounded-base box-border w-60 border",
        "flex items-center justify-between pr-4",
        "focus:shadow-input outline-none",
        "disabled:hover:bg-klerosUIComponentsWhiteBackground cursor-pointer disabled:cursor-not-allowed",
      )}
      {...props}
    >
      <SelectValue<IItem>>
        {(props) => (
          <ItemDisplayContainer {...props} placeholder={placeholder} />
        )}
      </SelectValue>
      <Arrow
        className={clsx(
          "hover-short-transition fill-klerosUIComponentsStroke ease-ease ml-2 size-4 transition",
          state?.isOpen && "rotate-180",
        )}
      />
    </Button>
  );
};

export default DropdownButton;
