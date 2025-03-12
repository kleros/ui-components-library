import React from "react";
import { ButtonProps } from ".";
import KlerosIcon from "../../assets/svgs/kleros.svg";
import { cn } from "../../utils";

const KlerosSymbol: React.FC<Pick<ButtonProps, "isDisabled" | "variant">> = ({
  isDisabled,
  variant,
}) => {
  const isPrimary = variant === "primary" || variant === undefined;
  const isSecondary = variant === "secondary";
  const isTertiary = variant === "tertiary";
  return (
    <KlerosIcon
      className={cn(
        "button-loading",
        "absolute h-[22px]",
        "fill-klerosUIComponentsStroke animate-breathing",
        (isPrimary || isTertiary) && ["fill-klerosUIComponentsWhiteBackground"],
        isSecondary && ["fill-klerosUIComponentsPrimaryBlue"],
        isDisabled && ["fill-klerosUIComponentsStroke"],
      )}
    />
  );
};

export default KlerosSymbol;
