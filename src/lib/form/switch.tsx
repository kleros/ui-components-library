import React from "react";
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from "react-aria-components";
import { cn } from "../../utils";
interface SwitchBaseProps {
  small?: boolean;
}

type SwitchProps = SwitchBaseProps & AriaSwitchProps;

/** A switch allows a user to turn a setting on or off.  */
function Switch({
  small,
  isSelected,
  className,
  ...props
}: Readonly<SwitchProps>) {
  return (
    <AriaSwitch
      {...props}
      className={cn(
        "relative box-border inline-block",
        small ? "h-4 w-8" : "h-6 w-12",
        className,
      )}
    >
      <span
        className={cn(
          "bg-klerosUIComponentsStroke cursor-pointer rounded-[34px] duration-400",
          "absolute top-0 right-0 bottom-0 left-0",
          "before:absolute before:bottom-0.5 before:left-0.5 before:rounded-full before:bg-white before:duration-400",
          small ? "before:size-3" : "before:size-5",
          isSelected && [
            "bg-klerosUIComponentsPrimaryBlue",
            small ? "before:translate-x-4" : "before:translate-x-6",
          ],
        )}
      />
    </AriaSwitch>
  );
}

export default Switch;
