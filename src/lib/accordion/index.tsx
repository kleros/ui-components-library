import React, { ReactNode, useState } from "react";
import AccordionItem from "./accordion-item";
import clsx from "clsx";

interface AccordionItem {
  title: string;
  body: ReactNode;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultExpanded?: number;
  className?: string;
}

const DefaultTitle: React.FC<{ item: AccordionItem }> = ({ item }) => (
  <>
    {item.icon ?? (item.Icon && <item.Icon />)}
    <p className="w-fit text-center font-semibold">{item.title}</p>
  </>
);

const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultExpanded,
  className,
  ...props
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded ?? -1);
  return (
    <div
      className={clsx("box-border flex w-[1000px] flex-col", className)}
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
};

export default Accordion;
