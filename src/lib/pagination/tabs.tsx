import React, { ReactNode, useCallback, useState } from "react";

import { cn } from "../../utils";
import {
  Tabs as AriaTabs,
  Collection,
  Tab,
  TabList,
  TabPanel,
  type TabsProps as AriaTabsProps,
  type Key,
  type TabListProps,
  type TabPanelProps,
  type TabProps,
} from "react-aria-components";

interface TabsItem {
  /** Unique id for each tab panel */
  id: Key;
  text: string;
  /** Value associated with each tab. Passed as an arg to callback function. */
  value: any;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Content to display when this tab is selected. */
  content: ReactNode;
  /** Props for Tab
   * [See TabProps](https://react-spectrum.adobe.com/react-aria/Tabs.html#tab)
   */
  tabProps?: TabProps;
  /**
   * Can be used to provide separate styling for a TabPanel, apart from one passed in panelClassName parent props.
   * [See TabPanelProps](https://react-spectrum.adobe.com/react-aria/Tabs.html#tabpanel)
   */
  tabPanelProps?: TabPanelProps;
}

interface TabsProps extends Omit<AriaTabsProps, "orientation"> {
  items: TabsItem[];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback?: Function;
  className?: string;
  /** ClassName to provide a common style for all TabPanels */
  panelClassName?: string;
  /**
   * Can be used to override default style.
   * [See TablistProps](https://react-spectrum.adobe.com/react-aria/Tabs.html#tablist)
   */
  tabListProps?: TabListProps<TabProps>;
}

/** Tabs organize content into multiple sections and allow users to navigate between them. */
function Tabs({
  items,
  className,
  tabListProps,
  panelClassName,
  callback,
  defaultSelectedKey,
  ...props
}: Readonly<TabsProps>) {
  const [selectedKey, setSelectedKey] = useState<Key | undefined>(
    defaultSelectedKey,
  );

  const handleSelection = useCallback(
    (key: Key) => {
      setSelectedKey(key);
      const selectedItem = items.find((item) => item.text === key);
      if (selectedItem && callback) callback(key, selectedItem.value);
    },
    [items, callback],
  );

  return (
    <AriaTabs
      className={cn("box-border flex flex-col", className)}
      {...props}
      onSelectionChange={handleSelection}
    >
      <TabList
        className={cn("box-border flex h-fit w-full", tabListProps?.className)}
        {...tabListProps}
      >
        {items.map(({ id, Icon, icon, text, disabled }) => (
          <Tab
            id={id}
            key={id}
            isDisabled={disabled}
            className={cn(
              "hover-short-transition h-[45px] bg-none hover:cursor-pointer",
              "flex grow items-center justify-center",
              "border-b-klerosUIComponentsStroke border-b-[3px]",
              id === selectedKey && ["border-b-klerosUIComponentsPrimaryBlue"],
              disabled && ["hover:cursor-default"],
              id !== selectedKey &&
                !disabled && [
                  "hover:hover-long-transition",
                  "hover:border-b-klerosUIComponentsSecondaryBlue",
                ],
            )}
          >
            {icon ??
              (Icon && (
                <Icon
                  className={cn(
                    "hover-short-transition size-4",
                    "fill-klerosUIComponentsPrimaryText mr-4",
                    id === selectedKey && "fill-klerosUIComponentsPrimaryBlue",
                    disabled && "fill-klerosUIComponentsStroke",
                  )}
                />
              ))}
            <span
              className={cn(
                "text-klerosUIComponentsPrimaryText",
                id === selectedKey && "text-klerosUIComponentsPrimaryBlue",
                disabled && "text-klerosUIComponentsStroke",
              )}
            >
              {text}
            </span>
          </Tab>
        ))}
      </TabList>

      <Collection items={items}>
        {(item) => (
          <TabPanel
            className={cn(
              "box-border h-fit w-full",
              panelClassName,
              // custom style for a panel should override parent style provided with panelClassName
              item?.tabPanelProps?.className,
            )}
            {...item.tabPanelProps}
          >
            {item.content}
          </TabPanel>
        )}
      </Collection>
    </AriaTabs>
  );
}

export default Tabs;
