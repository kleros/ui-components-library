import React from "react";
import { ButtonProps } from ".";
import { cn } from "../../utils";

const ButtonText: React.FC<
  Pick<ButtonProps, "text" | "isDisabled" | "isLoading" | "variant">
> = ({ text, isDisabled, isLoading, variant }) => {
  const isSecondary = variant === "secondary";
  return (
    <p
      className={cn(
        "button-text",
        "text-klerosUIComponentsWhiteBackground text-center leading-[22px] font-semibold whitespace-pre",
        isLoading && ["invisible"],
        isSecondary && ["text-klerosUIComponentsPrimaryBlue"],
        isDisabled && ["text-klerosUIComponentsStroke"],
      )}
    >
      {text}
    </p>
  );
};

export default ButtonText;
