import React, { ReactNode } from "react";
import { BaseButtonProps } from "./base";
import PrimaryButton from "./primary";
import SecondaryButton from "./secondary";
import TertiaryButton from "./tertiary";

interface ButtonProps extends BaseButtonProps {
  text: string;
  icon?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  text,
  variation,
  icon,
  onClick,
  ...props
}) => {
  let ButtonType = PrimaryButton;
  if (variation === "secondary") ButtonType = SecondaryButton;
  if (variation === "tertiary") ButtonType = TertiaryButton;

  return (
    <ButtonType variation={variation} onClick={onClick} {...props}>
      {icon}
      <p>{text}</p>
    </ButtonType>
  );
};

export default Button;
