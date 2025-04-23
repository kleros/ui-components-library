import React, { useEffect } from "react";
import { useListData } from "react-stately";
import {
  Button,
  ListBox,
  ListBoxItem,
  useDragAndDrop,
  type ListBoxItemProps,
  type ListBoxProps,
  type DragAndDropOptions,
} from "react-aria-components";
import { cn } from "../../utils";
import DragAndDropIcon from "../../assets/svgs/drag-and-drop.svg";
import Trash from "../../assets/svgs/trash.svg";
import clsx from "clsx";

type ListItem = {
  id: string | number;
  name: string;
  value: any;
};
interface IDraggableList
  extends Omit<
    ListBoxProps<ListBoxItemProps>,
    | "items"
    | "selectionMode"
    | "dragAndDropHooks"
    | "selectionBehavior"
    | "orientation"
    | "onSelectionChange"
  > {
  items: ListItem[];
  /** Returns the updated list after a delete or move operation. */
  updateCallback?: (updatedItems: ListItem[]) => void;
  /** Returns the selected item. */
  selectionCallback?: (list: ListItem) => void;
  /** Display custom preview for the item being dragged.  */
  renderDragPreview?: DragAndDropOptions["renderDragPreview"];
}

/** List that allows users to reorder items via drag and drop */
function DraggableList({
  items,
  updateCallback,
  selectionCallback,
  className,
  renderDragPreview,
  ...props
}: Readonly<IDraggableList>) {
  const list = useListData({
    initialItems: items,
  });

  useEffect(() => {
    if (!updateCallback) return;
    updateCallback(list.items);
  }, [list, updateCallback, items]);

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({ "text/plain": list.getItem(key)!.name })),
    getAllowedDropOperations: () => ["move"],
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === "after") {
        list.moveAfter(e.target.key, e.keys);
      }
    },
    renderDragPreview,
  });

  return (
    <ListBox
      {...props}
      aria-label={props["aria-label"] ?? "Reorderable list"}
      selectionMode="single"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
      onSelectionChange={(keys) => {
        const keyArr = Array.from(keys);
        const selectedItem = list.getItem(keyArr[0]);

        if (selectionCallback && selectedItem) selectionCallback(selectedItem);
      }}
      className={cn(
        "bg-klerosUIComponentsLightBackground rounded-base border-klerosUIComponentsStroke border",
        "py-4",
        "[&_div]:data-drop-target:outline-klerosUIComponentsPrimaryBlue [&_div]:data-drop-target:outline",
        className,
      )}
    >
      {(item) => (
        <ListBoxItem
          textValue={item.name}
          className={({ isHovered, isDragging, isSelected }) =>
            cn(
              "h-11.25 w-95.5 cursor-pointer border-l-3 border-l-transparent",
              "flex items-center gap-4 px-4",
              "focus-visible:outline-klerosUIComponentsPrimaryBlue focus-visible:outline",
              (isHovered || isSelected) && "bg-klerosUIComponentsMediumBlue",
              isSelected && "border-l-klerosUIComponentsPrimaryBlue",
              isDragging && "cursor-grabbing opacity-60",
            )
          }
        >
          {({ isHovered }) => (
            <>
              <DragAndDropIcon className="size-4 cursor-grab" />
              <span className="text-klerosUIComponentsPrimaryText flex-1 text-base">
                {item.name}
              </span>
              {isHovered ? (
                <Button
                  className={"cursor-pointer hover:scale-105"}
                  onPress={() => {
                    list.remove(item.id);
                  }}
                >
                  {({ isHovered: isButtonHovered }) => (
                    <Trash
                      className={clsx(
                        "ease-ease size-4 transition",
                        isButtonHovered &&
                          "[&_path]:fill-klerosUIComponentsPrimaryBlue",
                      )}
                    />
                  )}
                </Button>
              ) : null}
            </>
          )}
        </ListBoxItem>
      )}
    </ListBox>
  );
}

export default DraggableList;
