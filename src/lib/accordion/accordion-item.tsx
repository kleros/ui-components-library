import React, { ReactNode, useMemo } from "react";
import { useElementSize } from "../../hooks/useElementSize";
import Plus from "../../assets/svgs/accordion/plus.svg";
import Minus from "../../assets/svgs/accordion/minus.svg";

import { Button } from "react-aria-components";
import { cn } from "../../utils";

export interface AccordionItemProps {
  setExpanded: React.Dispatch<React.SetStateAction<number>>;
  index: number;
  /**
   * The title displayed in the accordion header.
   *
   * This is usually text, but can be any ReactNode.
   */
  title: ReactNode;
  /**
   * The body/content of the accordion section.
   * This is only visible when the item is expanded.
   */
  body: ReactNode;
  /**
   * Custom render function for the expand/collapse button.
   *
   * This function receives:
   *  - `expanded`: boolean => whether the item is currently expanded
   *  - `toggle`: function => expands/collapses this item when called
   *
   * Example:
   * ```
   * expandButton={({ expanded, toggle }) => (
   *   <button onClick={toggle}>
   *     {expanded ? "-" : "+"}
   *   </button>
   * )}
   * ```
   *
   * If not provided, a default + or − icon will be shown.
   *
   * This button does NOT need to manage its own state — calling `toggle()`
   * properly expands/collapses the item.
   */
  expandButton?: (options: {
    expanded: boolean;
    toggle: () => void;
  }) => ReactNode;
  expanded: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  body,
  expandButton,
  index,
  expanded,
  setExpanded,
}) => {
  const [ref, { height }] = useElementSize();
  const ExpandButton = useMemo(
    () =>
      expandButton ? (
        expandButton({
          expanded,
          toggle: () => setExpanded(expanded ? -1 : index),
        })
      ) : expanded ? (
        <Minus
          className={cn("fill-klerosUIComponentsPrimaryText size-4 shrink-0")}
        />
      ) : (
        <Plus
          className={cn("fill-klerosUIComponentsPrimaryText size-4 shrink-0")}
        />
      ),
    [expanded, expandButton, index, setExpanded],
  );
  return (
    <div className="my-2">
      <Button
        id="expand-button"
        aria-expanded={expanded}
        className={cn(
          "bg-klerosUIComponentsWhiteBackground border-klerosUIComponentsStroke border",
          "hover-medium-blue hover-short-transition hover:cursor-pointer",
          "rounded-[3px] px-4 py-[11.5px] md:px-8",
          "flex w-full items-center justify-between gap-4",
        )}
        onPress={() => setExpanded(expanded ? -1 : index)}
      >
        {title}
        {ExpandButton}
      </Button>
      <div
        style={{ height: expanded ? `${height.toString()}px` : 0 }}
        className="overflow-hidden transition-[height] duration-(--klerosUIComponentsTransitionSpeed) ease-in-out"
      >
        <div className="p-4 md:p-8" id="body-wrapper" ref={ref}>
          {body}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
