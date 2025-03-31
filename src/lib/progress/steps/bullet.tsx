import React from "react";
import BulletCircle from "./bullet-circle";
import clsx from "clsx";
import { cn } from "../../../utils";

interface BulletProps {
  index: number;
  title: string;
  subitems?: string[];
  active?: boolean;
  completed?: boolean;
  line?: boolean;
  className?: string;
}

const Bullet: React.FC<BulletProps> = ({
  title,
  subitems,
  index,
  active,
  completed,
  line,
  className,
}) => (
  <div className={cn("flex w-fit grow basis-0", className)} aria-label={title}>
    <BulletCircle
      index={index}
      active={active}
      completed={completed}
      line={line}
    />
    <div className="mt-0.5 ml-4">
      <h2
        className={clsx(
          "text-sm font-semibold",
          active
            ? "text-klerosUIComponentsPrimaryText"
            : "text-klerosUIComponentsSecondaryText",
        )}
      >
        {title}
      </h2>
      {subitems && (
        <div className="flex flex-col">
          {subitems.map((item, i) => (
            <small
              className="text-klerosUIComponentsSecondaryText text-xs font-normal break-words"
              key={i}
              aria-label={item}
              aria-description={`subitem ${i + 1}`}
            >
              {item}
            </small>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default Bullet;
