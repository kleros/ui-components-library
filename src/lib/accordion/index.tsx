import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import AccordionItem from "./accordion-item";
import { p, borderBox } from "../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  display: flex;
  flex-direction: column;
  width: 1000px;
`;

interface AccordionItem {
  title: string;
  body: ReactNode;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

const AccordionTitle = styled.p`
  ${p}
  width: fit-content;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

const DefaultTitle: React.FC<{ item: AccordionItem }> = ({ item }) => (
  <>
    {item.icon ?? (item.Icon && <item.Icon />)}
    <AccordionTitle>{item.title}</AccordionTitle>
  </>
);

const Accordion: React.FC<AccordionProps> = ({ items, ...props }) => {
  const [expanded, setExpanded] = useState(-1);
  return (
    <Wrapper {...props}>
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
    </Wrapper>
  );
};

export default Accordion;
