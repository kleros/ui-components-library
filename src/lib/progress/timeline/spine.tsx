import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { isUndefined } from "../../../utils";

export const colorRegex = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");

export type VariantProp = { variant?: "accepted" | "refused" | string };

interface SpineProps extends VariantProp {
  line?: boolean;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const Spine: React.FC<SpineProps> = ({ variant, line, Icon, titleRef }) => {
  const [topHeight, setTopHeight] = useState<number>();

  useEffect(() => {
    const handleOffsetTopChange = () => {
      if (titleRef?.current) {
        const newOffsetTop = titleRef.current.offsetTop;
        if (newOffsetTop !== topHeight) {
          setTopHeight(newOffsetTop);
        }
      }
    };

    handleOffsetTopChange();

    window.addEventListener("resize", handleOffsetTopChange);

    return () => {
      window.removeEventListener("resize", handleOffsetTopChange);
    };
  }, [titleRef, topHeight]);

  return (
    <div className="flex h-auto flex-col items-center justify-start">
      {topHeight ? (
        <div
          className={clsx(
            "border-l-klerosUIComponentsStroke w-0 grow-0 border-l",
          )}
          style={{ height: `${topHeight}px` }}
        />
      ) : null}
      {Icon ? (
        <Icon />
      ) : (
        <div
          className={clsx(
            "bg-klerosUIComponentsWhiteBackground size-4 basis-auto rounded-lg border-2",
            {
              "border-klerosUIComponentsSuccess": variant === "accepted",
              "border-klerosUIComponentsError": variant === "refused",
              "border-klerosUIComponentsPrimaryBlue": isUndefined(variant),
            },
          )}
          style={
            variant && colorRegex.test(variant)
              ? { borderColor: variant }
              : undefined
          }
        />
      )}
      {line && (
        <div className="border-l-klerosUIComponentsStroke w-0 grow border-l" />
      )}
    </div>
  );
};

export default Spine;
