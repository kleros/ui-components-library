import React from "react";
import { StepsProps } from ".";
import Bullet from "./bullet";
import { cn } from "../../../utils";

const Steps: React.FC<StepsProps> = ({
  items,
  currentItemIndex,
  className,
}) => {
  const lastItem = items[items.length - 1];
  return (
    <ol
      className={cn("flex h-full flex-col", className)}
      aria-label="Vertical progress steps"
    >
      <div className="flex h-auto grow flex-col">
        {items.slice(0, -1).map(({ title, subitems }, i) => (
          <Bullet
            {...{ title, subitems }}
            completed={i < currentItemIndex}
            active={i === currentItemIndex}
            line={!(i + 1 === items.length)}
            index={i + 1}
            key={`${title}-${i}`}
          />
        ))}
      </div>
      <Bullet
        title={lastItem.title}
        subitems={lastItem.subitems}
        completed={items.length - 1 < currentItemIndex}
        active={items.length - 1 === currentItemIndex}
        index={items.length}
        className="grow-0 basis-auto"
      />
    </ol>
  );
};

export default Steps;
