import React from "react";
import { cn } from "../../utils";
import {
  Modal as AriaModal,
  type ModalOverlayProps,
} from "react-aria-components";

function Modal({
  className,
  ...props
}: ModalOverlayProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <AriaModal
      className={cn(
        "bg-klerosUIComponentsWhiteBackground h-[200px] w-[328px]",
        "rounded-base box-border",
        className,
      )}
    >
      {props.children}
    </AriaModal>
  );
}
export default Modal;
