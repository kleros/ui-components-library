import React, { ReactNode } from "react";
import { useElementSize } from "../../hooks/useElementSize";
import Plus from "../../assets/svgs/accordion/plus.svg";
import Minus from "../../assets/svgs/accordion/minus.svg";

import { Button } from "react-aria-components";
import { cn } from "../../utils";

interface AccordionItemProps {
  setExpanded: React.Dispatch<React.SetStateAction<number>>;
  index: number;
  title: ReactNode;
  body: ReactNode;
  expanded?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  body,
  index,
  expanded,
  setExpanded,
}) => {
  const [ref, { height }] = useElementSize();
  return (
    <div className="my-2">
      <Button
        id="expand-button"
        className={cn(
          "bg-klerosUIComponentsWhiteBackground border-klerosUIComponentsStroke border",
          "hover-medium-blue hover-short-transition hover:cursor-pointer",
          "rounded-[3px] px-4 py-[11.5px] md:px-8",
          "flex w-full items-center justify-between",
        )}
        onPress={() => setExpanded(expanded ? -1 : index)}
      >
        {title}
        {expanded ? (
          <Minus
            className={cn("fill-klerosUIComponentsPrimaryText size-4 shrink-0")}
          />
        ) : (
          <Plus
            className={cn("fill-klerosUIComponentsPrimaryText size-4 shrink-0")}
          />
        )}
      </Button>
      <div
        style={{ height: expanded ? `${height.toString()}px` : 0 }}
        className={cn(
          expanded ? `overflow-visible` : "overflow-hidden",
          "transition-[height] duration-(--klerosUIComponentsTransitionSpeed) ease-initial",
        )}
      >
        <div className="p-4 md:p-8" id="body-wrapper" ref={ref}>
          {body}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
