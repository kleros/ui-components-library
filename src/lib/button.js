import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const PrimaryButton = styled.button`
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: ${(props) => {
    if (props.small) return props.secondary ? "5px 23px" : "6px 24px";
    else return props.secondary ? "10.5px 31px" : "11.5px 32px";
  }};
  background: ${(props) => {
    if (props.secondary) return props.theme.lightBackground;
    else if (props.tertiary) return props.theme.secondaryPurple;
    else
      return props.disabled ? props.theme.lightGrey : props.theme.primaryBlue;
  }};
  border: ${(props) =>
    props.secondary ? "1px solid " + props.theme.primaryBlue : "none"};
  border-radius: 3px;

  transition: background 0.5s;

  :hover {
    background: ${(props) => {
      if (props.secondary) return props.theme.mediumBlue;
      else if (props.tertiary) return props.theme.primaryPurple;
      else
        return props.disabled
          ? props.theme.lightGrey
          : props.theme.secondaryBlue;
    }};
  }

  p {
    font-weight: 600;
    text-align: center;

    color: ${(props) =>
      props.secondary
        ? props.theme.primaryBlue
        : props.disabled
        ? props.theme.stroke
        : "white"};
  }

  svg {
    height: 16px;
    width: 16px;
    margin-right: 8px;
  }
`;

const Button = (props) => {
  return (
    <PrimaryButton {...props}>
      {props.content.icon}
      <p> {props.content.text} </p>
    </PrimaryButton>
  );
};

Button.propTypes = {
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  tertiary: PropTypes.bool,
  small: PropTypes.bool,
  content: PropTypes.shape({
    icon: PropTypes.node,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

export default Button;
