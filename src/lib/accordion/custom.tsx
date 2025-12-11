import React, { useState } from "react";
import AccordionItem, { AccordionItemProps } from "./accordion-item";
import { cn, isUndefined } from "../../utils";

export interface CustomAccordionProps {
  /**
   * Array of accordion items.
   *
   * Each item can optionally define its own `expandButton`.
   * If omitted, the parent-level `expandButton` (if provided) is used.
   */

  items: Pick<AccordionItemProps, "title" | "body" | "expandButton">[];
  className?: string;

  /**
   * Index of the item to expand by default.
   *
   * - Set to a number (0-based index) to expand an item on mount
   * - Leave undefined to start with all items collapsed
   */

  defaultExpanded?: number;
  /**
   * A global expand/collapse button renderer applied to every item
   * **unless that item provides its own expandButton**.
   *
   * Signature:
   * ```
   * expandButton?: ({ expanded, toggle }) => ReactNode;
   * ```
   *
   * Example:
   * ```
   * expandButton={({ expanded, toggle }) => (
   *   <Button onPress={toggle}>
   *     {expanded ? <ChevronUp /> : <ChevronDown />}
   *   <Button>
   * )}
   * ```
   */
  expandButton?: AccordionItemProps["expandButton"];
}

/**
 * @description This component manages a list of collapsible accordion items,
 * where only one item can be expanded at a time.
 * @param props - CustomAccordionProps
 * @returns JSX.Element
 */
function CustomAccordion({
  items,
  className,
  defaultExpanded,
  expandButton,
  ...props
}: Readonly<CustomAccordionProps>) {
  const [expanded, setExpanded] = useState(
    !isUndefined(defaultExpanded) ? defaultExpanded : -1,
  );
  return (
    <div
      className={cn(
        "box-border flex w-full max-w-[1000px] flex-col",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          index={index}
          title={item.title}
          body={item.body}
          expandButton={item.expandButton ?? expandButton}
          setExpanded={setExpanded}
          expanded={expanded === index}
        />
      ))}
    </div>
  );
}

export default CustomAccordion;
