import React, { ReactNode } from "react";
import styled from "styled-components";
import { useElementSize } from "../../hooks/useElementSize";
import Plus from "../../assets/svgs/accordion/plus.svg";
import Minus from "../../assets/svgs/accordion/minus.svg";
import { svg, button } from "../../styles/common-style";

const StyledDiv = styled.div`
  margin: 8px 0px;
  .accordion-button {
    ${button}
    width: 100%;
    background: ${({ theme }) => theme.klerosUIComponentsPrimaryPurple};
    border-radius: 3px;
    padding: 11.5px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .accordion-svg {
      ${svg}
      height: 16px;
      width: 16px;
    }
  }
`;

interface CollapsibleProps {
  expanded?: boolean;
  totalHeight: number;
}

const Collapsible = styled.div<CollapsibleProps>`
  height: ${(props) => (props.expanded ? props.totalHeight.toString() : "0")}px;
  overflow: hidden;
  transition: height ease
    ${({ theme }) => theme.klerosUIComponentsTransitionSpeed};
`;

const Body = styled.div`
  padding: 32px;
`;

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
    <StyledDiv>
      <button
        className="accordion-button"
        onClick={() => setExpanded(expanded ? -1 : index)}
      >
        {title}
        {expanded ? (
          <Minus className="accordion-svg" />
        ) : (
          <Plus className="accordion-svg" />
        )}
      </button>
      <Collapsible expanded={expanded} totalHeight={height}>
        <Body ref={ref}> {body} </Body>
      </Collapsible>
    </StyledDiv>
  );
};

export default AccordionItem;
