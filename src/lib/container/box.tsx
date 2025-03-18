import React from "react";
import { cn } from "../../utils";

function Box({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-klerosUIComponentsMediumBlue h-[200px] w-[328px]",
        "box-border rounded-[18px]",
        className,
      )}
    >
      {props.children}
    </div>
  );
}
export default Box;
