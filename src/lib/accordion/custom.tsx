import React, { ReactNode, useState } from "react";
import AccordionItem from "./accordion-item";
import clsx from "clsx";

interface AccordionItem {
  title: ReactNode;
  body: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

const CustomAccordion: React.FC<AccordionProps> = ({
  items,
  className,
  ...props
}) => {
  const [expanded, setExpanded] = useState(-1);
  return (
    <div
      className={clsx("box-border flex w-[1000px] flex-col", className)}
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
