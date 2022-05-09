import React from "react";
import { BaseButtonProps } from "./base";
import PrimaryButton from "./primary";
import SecondaryButton from "./secondary";
import TertiaryButton from "./tertiary";

interface ButtonProps extends BaseButtonProps {
  disabled?: boolean;
  text: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  text,
  variant,
  Icon,
  onClick,
  ...props
}) => {
  let ButtonType = PrimaryButton;
  if (variant === "secondary") ButtonType = SecondaryButton;
  if (variant === "tertiary") ButtonType = TertiaryButton;

  return (
    <ButtonType {...{ variant, onClick, ...props }}>
      {Icon && <Icon className="button-svg" />}
      <p className="button-text">{text}</p>
    </ButtonType>
  );
};

export default Button;
