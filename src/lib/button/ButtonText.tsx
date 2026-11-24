import React from "react";
import { ButtonProps } from ".";
import { cn } from "../../utils";
import { hasContent } from "../../utils/has-content";

const ButtonText: React.FC<
  Pick<ButtonProps, "text" | "isDisabled" | "isLoading" | "variant"> & {
    /** Shown instead of `text`. */
    children?: React.ReactNode;
  }
> = ({ text, children, isDisabled, isLoading, variant }) => {
  const isSecondary = variant === "secondary";
  // children can be rich, which a <p> does not allow; false, null and undefined fall back to text
  const rich = hasContent(children);
  const Element = rich ? "span" : "p";
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
      {rich ? children : text}
    </Element>
  );
};

export default ButtonText;
