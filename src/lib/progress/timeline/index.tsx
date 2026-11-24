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
  items: [TimelineItem, ...TimelineItem[]];
  className?: string;
}

/**
 * Each row is shifted by half its width, so the spine sits on the box's centre
 * line and the text runs from 24px beside it (8px half bullet + the text's 16px
 * margin; 28px from lg, where the margin is 20px). Capping the text at the rest
 * of that half keeps it inside the box; it wraps instead of running out.
 * The title and party are flex items, which never shrink below their longest
 * word, and the date sizes to its text: min-w-0 and max-w-full hold them to
 * the cap, so break-words also wraps an address, a hash or a long word.
 */
const textBesideSpine =
  "max-w-[calc(50%_-_24px)] break-words lg:max-w-[calc(50%_-_28px)] [&_h2]:min-w-0 [&_p]:min-w-0 [&_small]:max-w-full";

/** Timeline displays a chronological sequence with bullet points. */
function Timeline({ items, className, ...props }: Readonly<TimelineProps>) {
  const lastItem = items[items.length - 1];
  return (
    // The shifted rows reach half a box past one edge, with nothing drawn
    // there. Clipping that overflow keeps it from widening the page (a
    // sideways scroll on phones) without making the list a scroll container.
    <ol
      className={cn("box-border flex flex-col overflow-x-clip", className)}
      {...props}
      aria-label="Timeline"
    >
      {items.slice(0, -1).map((item, i) => (
        <Bullet
          key={`${item.title}-${i}`}
          line
          {...item}
          isFirst={i === 0}
          isLast={false}
          textClassName={textBesideSpine}
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
        isFirst={items.length === 1}
        isLast={true}
        textClassName={textBesideSpine}
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
