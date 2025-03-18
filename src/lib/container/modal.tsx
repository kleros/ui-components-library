import React from "react";
import { cn } from "../../utils";
import {
  Modal as AriaModel,
  type ModalOverlayProps,
} from "react-aria-components";

function Modal({
  className,
  ...props
}: ModalOverlayProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <AriaModel
      className={cn(
        "bg-klerosUIComponentsWhiteBackground h-[200px] w-[328px]",
        "rounded-base box-border",
        className,
      )}
    >
      {props.children}
    </AriaModel>
  );
}
export default Modal;
