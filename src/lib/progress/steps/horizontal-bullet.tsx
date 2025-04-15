import React from "react";
import BulletCircle from "./bullet-circle";
import { useElementSize } from "../../../hooks/useElementSize";
import clsx from "clsx";

interface IContainer {
  last?: boolean;
  completed?: boolean;
}

interface ITextWrapper {
  active?: boolean;
}

interface HorizontalBulletProps extends IContainer, ITextWrapper {
  index: number;
  title: string;
  subitems?: string[];
}

const HorizontalBullet: React.FC<HorizontalBulletProps> = ({
  index,
  title,
  subitems,
  active,
  last,
  completed,
}) => {
  const [textRef, { height }] = useElementSize<HTMLDivElement>();
  const paddingBottom = height;

  return (
    <li
      className={clsx(
        "relative flex h-fit items-start justify-center",
        "lg:!pb-0",
        last
          ? "grow-0"
          : [
              "grow",
              "after:mx-4 after:my-3 after:h-0 after:w-auto after:grow after:border-t",
              completed
                ? "after:border-t-klerosUIComponentsPrimaryBlue"
                : "after:border-t-klerosUIComponentsStroke",
            ],
      )}
      style={
        paddingBottom ? { paddingBottom: `${paddingBottom}px` } : undefined
      }
      aria-label={title}
      role="listitem"
      aria-current={active ? "step" : undefined}
      aria-disabled={!active && !completed ? true : undefined}
    >
      <BulletCircle {...{ active, completed, index }} />
      <div
        className={clsx(
          "lg:static lg:top-auto lg:left-auto lg:ml-2 lg:flex lg:translate-x-0 lg:flex-col lg:items-start",
          "absolute top-6 left-0 ml-0 translate-x-[calc(-50%+12px)] items-center text-center",
        )}
        ref={textRef}
        {...{ active }}
      >
        <h2
          className={clsx(
            "text-sm font-semibold md:leading-6",
            active
              ? "text-klerosUIComponentsPrimaryText"
              : "text-klerosUIComponentsSecondaryText",
          )}
          id={`horizontal-step-${index}-title`}
        >
          {title}
        </h2>
        {subitems
          ? subitems.map((item, i) => (
              <small
                className="text-klerosUIComponentsSecondaryText text-xs font-normal break-words"
                key={`${item}-${i}`}
                aria-label={item}
                aria-description={`subitem ${i + 1}`}
              >
                {item}
              </small>
            ))
          : null}
      </div>
    </li>
  );
};

export default HorizontalBullet;
