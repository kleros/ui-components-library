import React from "react";
import {
  type Key,
  ListBoxItem,
  type ListBoxItemProps,
} from "react-aria-components";
import { cn } from "../../../utils";
import Dot from "../../dot";
import clsx from "clsx";

export interface BaseItem {
  text: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: React.ReactNode;
  dot?: string;
  itemValue?: any;
}

export interface IItem
  extends BaseItem,
    Omit<ListBoxItemProps, "children" | "value"> {
  id: Key;
}

const Item: React.FC<IItem> = ({ text, Icon, icon, dot, ...props }) => {
  return (
    <ListBoxItem
      className={cn(
        "hover-short-transition box-border cursor-pointer outline-none",
        "flex items-center py-[10.5px] pr-4 pl-3.25",
        "hover:bg-klerosUIComponentsMediumBlue focus:bg-klerosUIComponentsMediumBlue",
        "selected:bg-klerosUIComponentsMediumBlue",
        "selected:border-l-klerosUIComponentsPrimaryBlue selected:border-l-3",
        "disabled:bg-klerosUIComponentsStroke disabled:cursor-not-allowed",
      )}
      {...props}
      textValue={text}
    >
      {({ isDisabled }) => (
        <>
          {icon ??
            (Icon && <Icon className="max-h-4 min-h-3 max-w-4 min-w-3" />)}
          {dot && <Dot className="mr-2" color={dot} />}
          <p
            className={clsx(
              "text-base",
              isDisabled
                ? "text-klerosUIComponentsSecondaryText"
                : "text-klerosUIComponentsPrimaryText",
            )}
          >
            {text}
          </p>
        </>
      )}
    </ListBoxItem>
  );
};

export default Item;
