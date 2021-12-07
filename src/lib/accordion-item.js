import React from "react";
import styled from "styled-components";
import Plus from "../assets/svgs/plus.svg";
import Minus from "../assets/svgs/minus.svg";


const StyledDiv = styled.div`
  margin: 8px;
  button {
    width: 100%;
    background: ${props => props.theme.primaryPurple};
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
`

const Collapsible = styled.div`
  height: ${props => props.expanded ? "auto" : "0"};
  padding: ${props => props.expanded ? "32px" : "0px"} 32px;
  overflow: hidden;

  p {
    font-size: 14px;
    font-weight: 400;
    color: ${props => props.theme.primaryText};
  }

  transition:
    height ease 0.25s,
    padding ease 0.25s;
`

const AccordionItem = (props) => {
  return (
    <StyledDiv>
      <button onClick={() => {
        if (props.expanded)
          props.setExpanded(-1)
        else
          props.setExpanded(props.index)
      }}>
        <p> {props.title} </p>
        {props.expanded ? <Minus /> : <Plus />}
      </button>
      <Collapsible expanded={props.expanded}>
        {props.body}
      </Collapsible>
    </StyledDiv>
  );
};

export default AccordionItem;
