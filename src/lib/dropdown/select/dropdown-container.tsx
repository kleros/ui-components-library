import clsx from "clsx";
import React from "react";
import { Collection, ListBox, Popover } from "react-aria-components";
import Scrollbar from "../../scrollbar";
import Item, { IItem } from "./item";
import { cn } from "../../../utils";

const DropdownContainer: React.FC<{
  isOpen?: boolean;
  items: IItem[];
  className?: string;
}> = ({ isOpen, items, className }) => {
  return (
    <Popover
      className={cn(
        "bg-klerosUIComponentsWhiteBackground rounded-base border-klerosUIComponentsStroke border",
        "shadow-default focus:outline-klerosUIComponentsPrimaryBlue box-border overflow-hidden outline-none",
        // never narrower than the trigger, so a widened button keeps a matching list
        "w-60 min-w-(--trigger-width)",
        "origin-top transform transition",
        isOpen
          ? "entering:animate-scale-in scale-y-100"
          : "exiting:animate-scale-out scale-y-0",
        className,
      )}
    >
      <Scrollbar className="max-h-87.5 w-full">
        <ListBox
          id="listbox"
          className={clsx(
            "bg-klerosUIComponentsWhiteBackground box-border w-full",
            "cols-[repeat(auto-fill,_minmax(0,_45px))] grid grow py-4",
          )}
        >
          <Collection items={items}>{(item) => <Item {...item} />}</Collection>
        </ListBox>
      </Scrollbar>
    </Popover>
  );
};
export default DropdownContainer;
