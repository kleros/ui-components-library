import React, { ReactNode } from "react";
import { BaseButtonProps } from "./base";
import PrimaryButton from "./primary";
import SecondaryButton from "./secondary";
import TertiaryButton from "./tertiary";

interface ButtonProps extends BaseButtonProps {
  disabled?: boolean;
  text: string;
  icon?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  text,
  variant,
  icon,
  onClick,
  ...props
}) => {
  let ButtonType = PrimaryButton;
  if (variant === "secondary") ButtonType = SecondaryButton;
  if (variant === "tertiary") ButtonType = TertiaryButton;

  return (
    <ButtonType {...{ variant, onClick, ...props }}>
      {icon}
      <p>{text}</p>
    </ButtonType>
  );
};

export default Button;
