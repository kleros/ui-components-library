import React, { ReactNode, useState } from "react";
import AccordionItem from "./accordion-item";
import { cn, isUndefined } from "../../utils";

interface AccordionItem {
  title: ReactNode;
  body: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  defaultExpanded?: number;
}

const CustomAccordion: React.FC<AccordionProps> = ({
  items,
  className,
  defaultExpanded,
  ...props
}) => {
  const [expanded, setExpanded] = useState(
    !isUndefined(defaultExpanded) ? defaultExpanded : -1,
  );
  return (
    <div
      className={cn("box-border flex w-[1000px] flex-col", className)}
      {...props}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          index={index}
          title={item.title}
          body={item.body}
          setExpanded={setExpanded}
          expanded={expanded === index}
        />
      ))}
    </div>
  );
};

export default CustomAccordion;
