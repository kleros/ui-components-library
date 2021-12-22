import React from "react";
import PropTypes from "prop-types";
import PrimaryButton from "./primary";
import SecondaryButton from "./secondary";
import TertiaryButton from "./tertiary";

const Button = ({ text, icon, ...props }) => {
  let ButtonType;
  if (props.secondary) ButtonType = SecondaryButton;
  else if (props.tertiary) ButtonType = TertiaryButton;
  else ButtonType = PrimaryButton;

  return (
    <ButtonType {...props}>
      {icon}
      <p>{text}</p>
    </ButtonType>
  );
};

Button.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.node,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  tertiary: PropTypes.bool,
  small: PropTypes.bool,
};

export default Button;
