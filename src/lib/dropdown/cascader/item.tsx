import React from "react";
import { TreeItemContent, type Key, Button } from "react-aria-components";
import clsx from "clsx";
import { cn } from "../../../utils";
import LightArrow from "../../../assets/svgs/arrows/light-left.svg";

export interface IItem {
  label: string;
  itemValue: number | string;
  id: Key;
  children?: IItem[];
}

const Item: React.FC<IItem> = ({ label, children, id }) => {
  return (
    <TreeItemContent>
      {({ isDisabled, isSelected, isHovered, isExpanded, state }) => (
        <div
          id={id.toString()}
          className={cn(
            "relative box-border size-full cursor-pointer outline-none",
            "flex items-center py-[10.5px] pl-3.25",
            isDisabled && "cursor-not-allowed",
            children ? "pr-14" : "pr-8",
          )}
        >
          <p
            className={clsx(
              "w-fit text-base break-words",
              children ? "max-w-42" : "max-w-49.5",
              isDisabled
                ? "text-klerosUIComponentsSecondaryText"
                : "text-klerosUIComponentsPrimaryText",
            )}
          >
            {label}
          </p>

          <Button
            slot="chevron"
            className={clsx(
              "absolute right-4 cursor-pointer disabled:cursor-not-allowed",
              "flex items-center gap-1",
            )}
            isDisabled={isDisabled}
            onPress={(e) => {
              state.selectionManager.setSelectedKeys([id]);
              e.continuePropagation();
            }}
          >
            {children && children?.length > 0 && (
              <label
                className={cn(
                  "border-klerosUIComponentsStroke ease-ease size-6 rounded-full border transition",
                  "flex items-center justify-center",
                  "text-klerosUIComponentsStroke text-sm",
                  isHovered &&
                    "border-klerosUIComponentsPrimaryBlue text-klerosUIComponentsPrimaryBlue cursor-pointer",
                  isSelected &&
                    "border-klerosUIComponentsPrimaryBlue text-klerosUIComponentsPrimaryBlue",
                  isDisabled && "cursor-not-allowed",
                )}
              >
                {children.length}
              </label>
            )}
            {children && (
              <LightArrow
                className={cn(
                  "ease-ease max-h-4 min-h-3 max-w-4 min-w-3 rotate-180 transition",
                  isExpanded && "rotate-0",
                  isSelected
                    ? "fill-klerosUIComponentsPrimaryBlue"
                    : "fill-klerosUIComponentsStroke",
                  isHovered && "fill-klerosUIComponentsPrimaryBlue",
                )}
              />
            )}
          </Button>
        </div>
      )}
    </TreeItemContent>
  );
};

export default Item;
