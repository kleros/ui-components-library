import React from "react";
import { BaseButtonProps } from "./base";
import PrimaryButton from "./primary";
import SecondaryButton from "./secondary";
import TertiaryButton from "./tertiary";
import KlerosSymbol from "../../assets/svgs/kleros.svg";

interface ButtonProps extends Omit<BaseButtonProps, "$loading"> {
  disabled?: boolean;
  text: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  text,
  variant,
  Icon,
  icon,
  onClick,
  isLoading,
  ...props
}) => {
  let ButtonType = PrimaryButton;
  if (variant === "secondary") ButtonType = SecondaryButton;
  if (variant === "tertiary") ButtonType = TertiaryButton;

  return (
    <ButtonType {...{ variant, onClick, isLoading, ...props }}>
      {isLoading && <KlerosSymbol className="button-loading" />}
      {icon ?? (Icon && <Icon className="button-svg" />)}
      <p className="button-text">{text}</p>
    </ButtonType>
  );
};

export default Button;
