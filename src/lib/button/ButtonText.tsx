import React from "react";
import { ButtonProps } from ".";
import { cn } from "../../utils";

const ButtonText: React.FC<
  Pick<ButtonProps, "text" | "isDisabled" | "isLoading" | "variant"> & {
    /** Shown instead of `text`. */
    children?: React.ReactNode;
  }
> = ({ text, children, isDisabled, isLoading, variant }) => {
  const isSecondary = variant === "secondary";
  // children can be rich, which a <p> does not allow
  const Element = children === undefined ? "p" : "span";
  return (
    <Element
      className={cn(
        "button-text",
        "text-klerosUIComponentsWhiteBackground text-center text-base leading-[22px] font-semibold whitespace-pre",
        isLoading && ["invisible"],
        isSecondary && ["text-klerosUIComponentsPrimaryBlue"],
        isDisabled && ["text-klerosUIComponentsStroke"],
      )}
    >
      {children ?? text}
    </Element>
  );
};

export default ButtonText;
