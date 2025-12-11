import React, { ReactNode, useState } from "react";
import AccordionItem from "./accordion-item";
import { cn, isUndefined } from "../../utils";

export interface AccordionItemProps {
  title: string;
  body: ReactNode;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: ReactNode;
}

export interface AccordionProps {
  /**
   * Array of accordion items.
   */
  items: AccordionItemProps[];
  /**
   * Index of the item to expand by default.
   *
   * - Set to a number (0-based index) to expand an item on mount
   * - Leave undefined to start with all items collapsed
   */
  defaultExpanded?: number;
  className?: string;
}

const DefaultTitle: React.FC<{ item: AccordionItemProps }> = ({ item }) => (
  <>
    {item.icon ?? (item.Icon && <item.Icon />)}
    <p className="w-fit text-center text-base font-semibold">{item.title}</p>
  </>
);

/**
 * @description This component manages a list of collapsible accordion items,
 * where only one item can be expanded at a time.
 * @param props - AccordionProps
 * @returns JSX.Element
 */
function Accordion({
  items,
  defaultExpanded,
  className,
  ...props
}: Readonly<AccordionProps>) {
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
          title={<DefaultTitle {...{ item }} />}
          body={item.body}
          setExpanded={setExpanded}
          expanded={expanded === index}
        />
      ))}
    </div>
  );
}

export default Accordion;
