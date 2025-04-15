import React from "react";
import Card from "../container/card";
import { DisplayIconProps } from "./icon";
import { cn } from "../../utils";
import { Label } from "react-aria-components";

function DisplayLarge({
  text,
  Icon,
  label,
  className,
  ...props
}: Readonly<DisplayIconProps>) {
  return (
    <Card
      className={cn(
        "relative h-20 w-72",
        "flex flex-col items-start justify-center p-4",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="absolute top-4 right-4 max-h-4 max-w-4" />}
      <h1
        aria-labelledby={label}
        className="text-klerosUIComponentsPrimaryText text-2xl font-semibold"
      >
        {text}
      </h1>
      <Label
        id={label}
        className="text-klerosUIComponentsSecondaryText text-sm break-words"
      >
        {label}
      </Label>
    </Card>
  );
}

export default DisplayLarge;
