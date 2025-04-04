import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Collection,
  Tree,
  TreeItem,
  Popover,
  Dialog,
  type Key,
} from "react-aria-components";
import clsx from "clsx";
import SelectButton from "./select-button";
import Item, { IItem } from "./item";
import { cn } from "../../../utils";
import { IDropdownCascader } from ".";

interface IDropdownContainer
  extends Pick<
    IDropdownCascader,
    "disabledKeys" | "defaultSelectedKey" | "items" | "callback"
  > {
  isOpen?: boolean;
}

const DropdownContainer: React.FC<IDropdownContainer> = ({
  items,
  isOpen,
  disabledKeys,
  defaultSelectedKey,
  callback,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedKey, setSelectedKey] = useState<Key | null>(
    defaultSelectedKey ?? null,
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(new Set());

  const keyToLevelMap = useRef<
    Map<Key, { level: number; parentKey: Key | null }>
  >(new Map());

  useEffect(() => {
    if (defaultSelectedKey && isOpen)
      setExpandedKeys(new Set(getParentKeys(defaultSelectedKey)));
  }, [defaultSelectedKey, isOpen]);

  const scrollToLevel = useCallback(
    (level: number) => {
      const columnWidth = 239; // 238 + 1 for column gap
      const target = columnWidth * (level + 1);

      requestAnimationFrame(() => {
        if (gridRef.current) {
          gridRef.current?.scrollBy({
            left: target,
            behavior: "smooth",
          });
        }
      });
    },
    [gridRef],
  );

  const getParentKeys = (selectedKey: Key | null): Key[] => {
    const parentKeys: Key[] = [];
    let currentKey = selectedKey;

    // Traverse up the tree to find all parent keys until reaching null
    while (currentKey !== null) {
      const entry = keyToLevelMap.current.get(currentKey);
      if (!entry) break;

      parentKeys.push(currentKey);
      currentKey = entry.parentKey;
    }

    return parentKeys.reverse();
  };

  return (
    <Popover
      className={clsx(
        "bg-klerosUIComponentsWhiteBackground rounded-base border-klerosUIComponentsStroke box-border border",
        "shadow-default focus-visible:outline-klerosUIComponentsPrimaryBlue overflow-hidden",
        "w-60 origin-top transform transition lg:w-max lg:max-w-6xl",
        isOpen
          ? "entering:animate-scale-in scale-y-100"
          : "exiting:animate-scale-out scale-y-0",
      )}
    >
      <Dialog aria-label="dropdown-dialog">
        <Tree
          ref={gridRef}
          autoFocus="first"
          items={items}
          aria-label="dropdown-selection"
          selectionMode="single"
          selectionBehavior="toggle"
          disallowEmptySelection
          className={clsx(
            "scrollbar box-border max-h-87.5 min-w-59.5",
            "grid auto-cols-auto grid-flow-row-dense auto-rows-auto gap-x-0.25 gap-y-0.5 py-4",
            "relative",
          )}
          defaultSelectedKeys={selectedKey ? [selectedKey] : undefined}
          expandedKeys={expandedKeys}
          disabledKeys={disabledKeys}
          onSelectionChange={(selection) => {
            const key = Array.from(selection)[0];

            setExpandedKeys(new Set(getParentKeys(key)));
            scrollToLevel(expandedKeys.size);
            setSelectedKey(key);
          }}
          onExpandedChange={(keys) => {
            scrollToLevel(keys.size);
          }}
        >
          {function renderItem(
            item: IItem,
            level = 1,
            parentKey: Key | null = null,
          ) {
            keyToLevelMap.current.set(item.id, { level, parentKey });
            return (
              <TreeItem
                className={({ isFocusVisible, level }) =>
                  cn(
                    "w-59.5",
                    isFocusVisible &&
                      "bg-klerosUIComponentsMediumBlue outline-none",
                    "selected:bg-klerosUIComponentsMediumBlue hover:bg-klerosUIComponentsMediumBlue",
                    // This adds border between columns
                    level !== 1 && [
                      "before:bg-klerosUIComponentsStroke before:absolute before:w-0.25",
                      "before:top-0 before:bottom-0 before:left-[calc(var(--tree-item-level))_*_239px]",
                    ],
                  )
                }
                style={{
                  gridArea: `auto / var(--tree-item-level)`,
                }}
                textValue={item.label}
              >
                <Item {...item} />
                <Collection items={item.children}>
                  {(childrenItem) =>
                    renderItem(childrenItem, level + 1, item.id)
                  }
                </Collection>
              </TreeItem>
            );
          }}
        </Tree>
        <SelectButton {...{ selectedKey, callback }} />
      </Dialog>
    </Popover>
  );
};

export default DropdownContainer;
