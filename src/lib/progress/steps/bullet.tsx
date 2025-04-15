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
  <li
    className={cn("flex w-fit grow basis-0", className)}
    aria-label={title}
    role="listitem"
    aria-current={active ? "step" : undefined}
    aria-disabled={!active && !completed ? true : undefined}
  >
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
        id={`step-${index}-title`}
      >
        {title}
      </h2>
      {subitems && (
        <div className="flex flex-col">
          {subitems.map((item, i) => (
            <small
              className="text-klerosUIComponentsSecondaryText text-xs font-normal break-words"
              key={`${item}-${i}`}
              aria-label={item}
              aria-description={`subitem ${i + 1}`}
            >
              {item}
            </small>
          ))}
        </div>
      )}
    </div>
  </li>
);

export default Bullet;
