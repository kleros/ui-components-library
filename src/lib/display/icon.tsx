import React from "react";
import Card from "../container/card";
import { cn } from "../../utils";
import clsx from "clsx";
import { Label } from "react-aria-components";

export interface DisplayIconProps {
  text: string;
  Icon: React.FC<React.SVGAttributes<SVGElement>>;
  label?: string;
  className?: string;
}

function DisplayIcon({
  text,
  Icon,
  label,
  className,
  ...props
}: Readonly<DisplayIconProps>) {
  return (
    <Card className={cn("flex h-20 w-72 p-4", className)} {...props}>
      <Card className={clsx("size-12", "flex items-center justify-center")}>
        <Icon className="max--8 max-w-8" />
      </Card>
      <div
        className={clsx(
          "ml-4 box-border h-full",
          "flex flex-col items-start justify-center",
        )}
      >
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
      </div>
    </Card>
  );
}

export default DisplayIcon;
