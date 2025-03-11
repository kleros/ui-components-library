import React, { ReactNode } from "react";
import { useElementSize } from "../../hooks/useElementSize";
import Plus from "../../assets/svgs/accordion/plus.svg";
import Minus from "../../assets/svgs/accordion/minus.svg";

import clsx from "clsx";

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
    <div className="mt-2 mb-2">
      <button
        className={clsx(
          "bg-klerosUIComponentsWhiteBackground border-klerosUIComponentsStroke border",
          "hover-medium-blue hover-short-transition hover:cursor-pointer",
          "rounded-[3px] pt-[11.5px] pr-8 pb-[11.5px] pl-8",
          "flex w-full items-center justify-between",
        )}
        onClick={() => setExpanded(expanded ? -1 : index)}
      >
        {title}
        {expanded ? (
          <Minus
            className={clsx("fill-klerosUIComponentsPrimaryText h-4 w-4")}
          />
        ) : (
          <Plus
            className={clsx("fill-klerosUIComponentsPrimaryText h-4 w-4")}
          />
        )}
      </button>
      <div
        style={{ height: expanded ? `${height.toString()}px` : 0 }}
        className={clsx(
          expanded ? `overflow-visible` : "overflow-hidden",
          "transition-[height] duration-(--klerosUIComponentsTransitionSpeed) ease-initial",
        )}
      >
        <div className="p-8" ref={ref}>
          {body}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
