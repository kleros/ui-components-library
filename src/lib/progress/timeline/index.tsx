import React from "react";
import Bullet, { SideProp, VariantProp } from "./bullet";
import clsx from "clsx";
import { cn } from "../../../utils";

export interface TimelineItem extends SideProp, VariantProp {
  title: string;
  party: string;
  subtitle: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

/** Timeline displays a chronological sequence with bullet points. */
function Timeline({ items, className, ...props }: Readonly<TimelineProps>) {
  const lastItem = items[items.length - 1];
  return (
    <ol
      className={cn("box-border flex flex-col", className)}
      {...props}
      aria-label="Timeline"
    >
      {items.slice(0, -1).map((item, i) => (
        <Bullet
          key={`${item.title}-${i}`}
          line
          {...item}
          isLast={false}
          className={clsx(
            "relative",
            item.rightSided
              ? "translate-x-[calc(50%_-_8px)]"
              : "translate-x-[calc(-50%_+_8px)]",
          )}
        />
      ))}
      <Bullet
        {...lastItem}
        isLast={true}
        className={clsx(
          "relative",
          lastItem.rightSided
            ? "translate-x-[calc(50%_-_8px)]"
            : "translate-x-[calc(-50%_+_8px)]",
          "h-[unset] grow-0 basis-auto",
        )}
      />
    </ol>
  );
}

export default Timeline;
