import React from "react";
import { cn } from "../../utils";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import ButtonText from "./ButtonText";
import KlerosSymbol from "./KlerosSymbol";
import ButtonIcon from "./ButtonIcon";

export interface BaseButtonProps {
  variant?: "primary" | "secondary" | "tertiary";
  small?: boolean;
  isLoading?: boolean;
}

export interface ButtonProps
  extends AriaButtonProps,
    Omit<BaseButtonProps, "$loading"> {
  text: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  text,
  variant,
  Icon,
  icon,
  onClick,
  isLoading,
  className,
  isDisabled,
  ...props
}) => {
  const isPrimary = variant === "primary" || variant === undefined;
  const isSecondary = variant === "secondary";
  const isTertiary = variant === "tertiary";
  return (
    <AriaButton
      className={cn(
        "relative box-border h-fit w-fit",
        "flex flex-row items-center justify-center",
        "rounded-base hover:cursor-pointer",
        "ease-ease transition-[background] duration-(--klerosUIComponentsTransitionSpeed)",

        props.small ? "px-6 py-1.5" : "px-8 py-[11.5px]",
        isPrimary && [
          "bg-klerosUIComponentsPrimaryBlue hover:bg-klerosUIComponentsSecondaryBlue",
        ],
        isSecondary && [
          "bg-klerosUIComponentsWhiteBackground hover:bg-klerosUIComponentsMediumBlue",
          "border-klerosUIComponentsPrimaryBlue border",
          props.small ? "px-[23px] py-[5px]" : "px-[31px] py-[10.5px]",
        ],
        isTertiary && [
          "bg-klerosUIComponentsSecondaryPurple hover:bg-klerosUIComponentsPrimaryPurple",
        ],
        isDisabled && [
          "bg-klerosUIComponentsLightGrey hover:bg-klerosUIComponentsLightGrey hover:cursor-not-allowed",
          isSecondary && "border-klerosUIComponentsStroke border",
        ],
        className,
      )}
      {...{ variant, onClick, isLoading, isDisabled, ...props }}
    >
      {isLoading && <KlerosSymbol {...{ isDisabled, variant }} />}
      <ButtonIcon {...{ icon, Icon, isDisabled, isLoading, variant }} />
      <ButtonText {...{ isLoading, isDisabled, variant, text }} />
    </AriaButton>
  );
};

export default Button;
