import React from "react";
import { StepsProps } from ".";
import Bullet from "./horizontal-bullet";
import { cn } from "../../../utils";

const HorizontalSteps: React.FC<StepsProps> = ({
  items,
  currentItemIndex,
  className,
  ...props
}) => (
  <div
    className={cn(
      "box-border flex w-62.5 items-start justify-center",
      className,
    )}
    {...props}
    aria-orientation="horizontal"
  >
    {items.map((item, i) => (
      <Bullet
        {...item}
        completed={i < currentItemIndex}
        active={i === currentItemIndex}
        last={i + 1 === items.length}
        index={i + 1}
        key={i}
      />
    ))}
  </div>
);

export default HorizontalSteps;
