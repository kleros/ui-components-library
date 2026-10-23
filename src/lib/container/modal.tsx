import React from "react";
import { cn } from "../../utils";
import {
  Modal as AriaModal,
  Dialog,
  ModalOverlay,
  type DialogProps,
  type ModalOverlayProps,
} from "react-aria-components";

interface ModalProps
  extends Omit<ModalOverlayProps, "children">,
    React.RefAttributes<HTMLDivElement> {
  /** classname that applies to the modal overlay. */
  modalOverlayClassname?: ModalOverlayProps["className"];
  children?: DialogProps["children"];
  ariaLabel?: string;
}

/** ModalOverlay props that the nested Modal ignores, and warns about when given. */
const OVERLAY_ONLY_PROPS = new Set([
  "isOpen",
  "defaultOpen",
  "onOpenChange",
  "isDismissable",
  "isKeyboardDismissDisabled",
  "shouldCloseOnInteractOutside",
  "isEntering",
  "isExiting",
  "UNSTABLE_portalContainer",
]);

/** A modal is an overlay element which blocks interaction with elements outside it. */
function Modal({
  className,
  modalOverlayClassname,
  children,
  ariaLabel,
  ...props
}: Readonly<ModalProps>) {
  const modalProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !OVERLAY_ONLY_PROPS.has(key)),
  );
  return (
    <ModalOverlay
      className={cn(
        "fixed top-0 left-0 isolate",
        "z-20 h-(--visual-viewport-height) w-full bg-black/[50%] backdrop-blur-md",
        "flex items-center justify-center",
        "entering:animate-[fadeIn_100ms_ease-out] exiting:animate-[fadeOut_100ms_ease-in]",
        modalOverlayClassname,
      )}
      {...props}
    >
      <AriaModal {...modalProps}>
        <Dialog
          aria-label={ariaLabel ?? "Modal"}
          className={cn(
            "bg-klerosUIComponentsWhiteBackground h-[200px] w-[328px] outline-none",
            "rounded-base box-border",
            className,
          )}
        >
          {children}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}
export default Modal;
