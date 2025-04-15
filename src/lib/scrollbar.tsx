import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import React from "react";
import { cn } from "../utils";

function Scrollbar({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SimpleBar>) {
  return (
    <SimpleBar
      className={cn(
        "[&_.simplebar-scrollbar]:before:!bg-klerosUIComponentsPrimaryBlue",
        "[&_.simplebar-visible]:before:!opacity-100",
        "[&_.simplebar-mask]:!bg-klerosUIComponentsWhiteBackground",
        className,
      )}
      {...props}
    >
      {children}
    </SimpleBar>
  );
}
export default Scrollbar;
