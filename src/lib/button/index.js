import React from "react";
import PropTypes from "prop-types";
import PrimaryButton from "./primary";
import SecondaryButton from "./secondary";
import TertiaryButton from "./tertiary";

const Button = (props) => {
  if (props.secondary)
    return <SecondaryButton {...props}>{props.children}</SecondaryButton>;
  else if (props.tertiary)
    return <TertiaryButton {...props}>{props.children}</TertiaryButton>;
  else return <PrimaryButton {...props}>{props.children}</PrimaryButton>;
};

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.node),
  ]).isRequired,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  tertiary: PropTypes.bool,
  small: PropTypes.bool,
};

export default Button;
