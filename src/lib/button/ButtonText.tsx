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
        "text-klerosUIComponentsWhiteBackground text-center text-base leading-[22px] font-semibold whitespace-pre",
        // Hidden with opacity rather than `visibility` so the label stays in the
        // accessibility tree and keeps naming the button while it loads.
        isLoading && ["opacity-0"],
        isSecondary && ["text-klerosUIComponentsPrimaryBlue"],
        isDisabled && ["text-klerosUIComponentsStroke"],
      )}
    >
      {text}
    </p>
  );
};

export default ButtonText;
