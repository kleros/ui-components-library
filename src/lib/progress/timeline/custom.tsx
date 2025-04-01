import React from "react";
import Bullet, { SideProp, StateProp, VariantProp } from "./bullet";
import { cn } from "../../../utils";

interface TimelineItem extends SideProp, VariantProp, StateProp {
  title: string;
  party: string | React.ReactElement;
  subtitle: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
}

interface ICustomTimelineProps {
  items: [TimelineItem, ...TimelineItem[]];
  className?: string;
}

/** Custom Timeline displays a chronological sequence with bullet points. */
function CustomTimeline({
  items,
  className,
  ...props
}: Readonly<ICustomTimelineProps>) {
  const lastItem = items[items.length - 1];
  return (
    <div
      className={cn("box-border flex flex-col", className)}
      {...props}
      aria-label="Timeline"
      role="list"
    >
      {items.slice(0, -1).map((item, i) => (
        <Bullet key={i} line {...item} rightSided isLast={false} />
      ))}
      <Bullet
        className="h-[unset] grow-0 basis-auto"
        rightSided
        {...lastItem}
        isLast={true}
      />
    </div>
  );
}
export default CustomTimeline;
