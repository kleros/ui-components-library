import React, { ReactNode, useRef } from "react";
import styled from "styled-components";
import Plus from "../../assets/svgs/accordion/plus.svg";
import Minus from "../../assets/svgs/accordion/minus.svg";
import { p, svg, button } from "../../styles/common-style";

const StyledDiv = styled.div`
  margin: 8px 0px;
  .accordion-button {
    ${button}
    width: 100%;
    background: ${({ theme }) => theme.primaryPurple};
    border-radius: 3px;
    padding: 11.5px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .accordion-title {
      ${p}
      width: fit-content;
      font-weight: 600;
      text-align: center;
      color: white;
    }

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
  transition: height ease ${({ theme }) => theme.transitionSpeed};
`;

const Body = styled.div`
  padding: 32px;
`;

interface AccordionItemProps {
  setExpanded: React.Dispatch<React.SetStateAction<number>>;
  index: number;
  title: string;
  body: ReactNode;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  expanded?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  Icon,
  body,
  index,
  expanded,
  setExpanded,
}) => {
  const heightRef = useRef<number>(0);
  return (
    <StyledDiv>
      <button
        className="accordion-button"
        onClick={() => setExpanded(expanded ? -1 : index)}
      >
        {Icon && <Icon />}
        <p className="accordion-title">{title}</p>
        {expanded ? (
          <Minus className="accordion-svg" />
        ) : (
          <Plus className="accordion-svg" />
        )}
      </button>
      <Collapsible expanded={expanded} totalHeight={heightRef.current}>
        <Body ref={(ref) => (heightRef.current = ref?.clientHeight || 0)}>
          {body}
        </Body>
      </Collapsible>
    </StyledDiv>
  );
};

export default AccordionItem;
