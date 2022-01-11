import React, { useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Plus from "../../assets/svgs/accordion/plus.svg";
import Minus from "../../assets/svgs/accordion/minus.svg";

const StyledDiv = styled.div`
  margin: 8px;
  button {
    width: 100%;
    background: ${(props) => props.theme.primaryPurple};
    border-radius: 3px;
    padding: 11.5px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      width: fit-content;
      font-weight: 600;
      text-align: center;
      color: white;
    }

    svg {
      height: 16px;
      width: 16px;
    }
  }
`;

const Collapsible = styled.div`
  height: ${(props) => (props.expanded ? props.totalHeight.toString() : "0")}px;
  overflow: hidden;
  transition: height ease ${(props) => props.theme.transitionSpeed};
`;

const Body = styled.div`
  padding: 32px;
  small {
    color: ${(props) => props.theme.primaryText};
  }
`;

const AccordionItem = (props) => {
  const heightRef = useRef();
  return (
    <StyledDiv>
      <button
        onClick={() => {
          if (props.expanded) props.setExpanded(-1);
          else props.setExpanded(props.index);
        }}
      >
        {props.icon}
        <p> {props.title} </p>
        {props.expanded ? <Minus /> : <Plus />}
      </button>
      <Collapsible expanded={props.expanded} totalHeight={heightRef.current}>
        <Body ref={(ref) => (heightRef.current = ref?.clientHeight || 0)}>
          <small>{props.body}</small>
        </Body>
      </Collapsible>
    </StyledDiv>
  );
};

AccordionItem.propTypes = {
  setExpanded: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.node.isRequired,
  icon: PropTypes.node,
  expanded: PropTypes.bool,
};

export default AccordionItem;
