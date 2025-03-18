import React from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { cn } from "../../utils";
import clsx from "clsx";

interface BaseTagProps extends ButtonProps {
  active?: boolean;
}

interface TagProps extends BaseTagProps {
  text: string;
}

function Tag({ text, active, className, ...props }: Readonly<TagProps>) {
  return (
    <Button
      {...props}
      className={cn(
        "bg-klerosUIComponentsMediumBlue box-border h-8",
        "rounded-[300px] hover:cursor-pointer",
        "flex items-center justify-center px-4",
        active && ["border-klerosUIComponentsPrimaryBlue border"],
        className,
      )}
    >
      <p
        className={clsx(
          "hover-short-transition text-klerosUIComponentsPrimaryBlue",
          !active && ["hover:text-klerosUIComponentsSecondaryBlue"],
        )}
      >
        {text}
      </p>
    </Button>
  );
}

export default Tag;
