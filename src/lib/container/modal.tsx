import React from "react";
import { cn } from "../../utils";

function Modal({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-klerosUIComponentsWhiteBackground h-[200px] w-[328px]",
        "rounded-base box-border",
        className,
      )}
    >
      {props.children}
    </div>
  );
}
export default Modal;
