import React from "react";
import { cn } from "../utils";
interface DotProps {
  color: string;
  className?: string;
}

function Dot({ color, className }: Readonly<DotProps>) {
  return (
    <div
      style={{ background: color }}
      className={cn("box-border size-2 rounded-full", className)}
    />
  );
}
export default Dot;
