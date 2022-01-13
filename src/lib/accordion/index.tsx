import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import AccordionItem from "./accordion-item";

const Wrapper = styled.div`
  diplay: flex;
  flex-direction: column;
  width: 1000px;
`;

interface AccordionItem {
  title: string;
  body: ReactNode;
  icon?: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

const Accordion: React.FC<AccordionProps> = ({ items, ...props }) => {
  const [expanded, setExpanded] = useState(-1);
  return (
    <Wrapper {...props}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          index={index}
          title={item.title}
          icon={item.icon}
          body={item.body}
          setExpanded={setExpanded}
          expanded={expanded === index}
        />
      ))}
    </Wrapper>
  );
};

export default Accordion;
