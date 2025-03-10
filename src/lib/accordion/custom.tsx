import React, { ReactNode, useState } from "react";
import AccordionItem from "./accordion-item";

interface AccordionItem {
  title: ReactNode;
  body: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

const CustomAccordion: React.FC<AccordionProps> = ({ items, ...props }) => {
  const [expanded, setExpanded] = useState(-1);
  return (
    <div className="border-box flex w-[1000px] flex-col" {...props}>
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
