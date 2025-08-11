import React from "react";
import { cn } from "../../utils";
import { ButtonProps } from ".";

const ButtonIcon: React.FC<
  Pick<ButtonProps, "Icon" | "icon" | "isDisabled" | "isLoading" | "variant">
> = ({ Icon, icon, isDisabled, isLoading, variant }) => {
  const isSecondary = variant === "secondary";
  return icon ? (
    isLoading ? (
      <span
        className={cn("button-svg", "mr-2 size-4", "invisible")}
        aria-hidden
      />
    ) : (
      icon
    )
  ) : (
    Icon && (
      <Icon
        className={cn(
          "button-svg",
          "mr-2 size-4",
          "fill-klerosUIComponentsWhiteBackground",
          isLoading && ["invisible"],
          isSecondary && ["fill-klerosUIComponentsPrimaryBlue"],
          isDisabled && ["fill-klerosUIComponentsStroke"],
        )}
      />
    )
  );
};
export default ButtonIcon;
