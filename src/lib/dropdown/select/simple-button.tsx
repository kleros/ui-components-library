import clsx from "clsx";
import React from "react";
import { Button, type ButtonProps, SelectValue } from "react-aria-components";
import Arrow from "../../../assets/svgs/dropdown/arrow.svg";
import { cn } from "../../../utils";

interface ISimpleButton extends ButtonProps {
  isOpen: boolean;
  small?: boolean;
  placeholder?: string;
}

const SimpleButton: React.FC<ISimpleButton> = ({
  isOpen,
  small,
  placeholder,
  ...props
}) => {
  return (
    <Button
      className={clsx(
        "rounded-base p-1",
        "flex cursor-pointer items-center disabled:cursor-not-allowed",
        "focus:shadow-input outline-none",
      )}
      {...props}
    >
      {({ isHovered, isDisabled }) => (
        <>
          {small ? (
            <small
              className={cn(
                "hover-short-transition",
                "text-klerosUIComponentsPrimaryBlue text-sm font-semibold",
                isHovered && "text-klerosUIComponentsSecondaryBlue",
                isDisabled && "text-klerosUIComponentsSecondaryText",
              )}
            >
              <SelectValue>
                {({ isPlaceholder, selectedText }) =>
                  isPlaceholder ? placeholder : selectedText
                }
              </SelectValue>
            </small>
          ) : (
            <h1
              className={cn(
                "hover-short-transition",
                "text-klerosUIComponentsPrimaryBlue text-2xl font-semibold",
                isHovered && "text-klerosUIComponentsSecondaryText",
                isDisabled && "text-klerosUIComponentsSecondaryText",
              )}
            >
              <SelectValue>
                {({ isPlaceholder, selectedText }) =>
                  isPlaceholder ? placeholder : selectedText
                }
              </SelectValue>
            </h1>
          )}
          <Arrow
            className={cn(
              "hover-short-transition fill-klerosUIComponentsPrimaryBlue ease-ease ml-2 transition",
              small ? "size-2" : "size-4",
              isOpen && "rotate-180",
              isHovered && "fill-klerosUIComponentsSecondaryBlue",
              isDisabled && "fill-klerosUIComponentsSecondaryText",
            )}
          />{" "}
        </>
      )}
    </Button>
  );
};

export default SimpleButton;
