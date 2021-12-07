import React from "react";
import styled from "styled-components";


const PrimaryButton = styled.button`
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: ${props => {
    if (props.small)
      return props.secondary ? "5px 23px" : "6px 24px";
    return props.secondary ? "10.5px 31px": "11.5px 32px"
  }};
  background: ${props => {
    if (props.primary){
      return props.disabled ? props.theme.lightGrey : props.theme.primaryBlue
    } else {
      return (
        props.secondary ? props.theme.background : props.theme.primaryPurple
      )
    }
  }};
  border: ${props => props.secondary ? ("1px solid " + props.theme.primaryBlue) : "none"};
  border-radius: 3px;

  transition: background 0.5s;

  :hover {
    background: ${props => {
      if (props.primary){
        return props.disabled
          ? props.theme.lightGrey
          : props.theme.secondaryBlue
      } else {
        return (
          props.secondary
            ? props.theme.lightPurple
            : props.theme.secondaryPurple
        )
      }
    }};
  }

  p {
    font-weight: 600;
    text-align: center;

    color: ${props => (
      props.secondary
        ? props.theme.primaryBlue
        : props.disabled ? props.theme.stroke : "white"
    )};
  }

  svg {
    height: 16px;
    width: 16px;
    margin-right: 8px;
  }
`

const Button = (props) => {
  return (
    <PrimaryButton {...props}>
      {props.content.icon}
      <p>
        {props.content.text}
      </p>
    </PrimaryButton>
  );
}

export default Button;
