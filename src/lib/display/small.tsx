import React from "react";
import Card from "../container/card";
import { DisplayIconProps } from "./icon";
import { cn } from "../../utils";
import { Label } from "react-aria-components";
import clsx from "clsx";

function DisplaySmall({
  text,
  Icon,
  label,
  className,
  ...props
}: Readonly<DisplayIconProps>) {
  return (
    <div
      className={cn("box-border flex w-[217px] flex-col", className)}
      {...props}
    >
      <Label
        id={label}
        className="text-klerosUIComponentsPrimaryText text-sm break-words"
      >
        {label}
      </Label>
      <Card className={clsx("h-[45px] w-full", "mt-4 flex items-center px-4")}>
        {Icon && <Icon className="mr-2 max-h-4 max-w-4" />}
        <h2
          aria-labelledby={label}
          className="text-klerosUIComponentsPrimaryText text-base font-semibold"
        >
          {text}
        </h2>
      </Card>
    </div>
  );
}

export default DisplaySmall;
