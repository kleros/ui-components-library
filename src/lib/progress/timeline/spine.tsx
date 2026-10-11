import clsx from "clsx";
import React, { useLayoutEffect, useRef } from "react";
import { isUndefined } from "../../../utils";

export const colorRegex = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");

export type VariantProp = { variant?: "accepted" | "refused" | string };

interface SpineProps extends VariantProp {
  line?: boolean;
  isFirst?: boolean;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const Spine: React.FC<SpineProps> = ({
  variant,
  line,
  isFirst,
  Icon,
  titleRef,
}) => {
  const spacerRef = useRef<HTMLDivElement>(null);
  const bulletRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const title = titleRef?.current;
      const bullet = bulletRef.current;
      const spacer = spacerRef.current;
      if (!title || !bullet || !spacer) return;
      // Spacer ends where the bullet's centre meets the title's centre.
      const next = Math.max(
        0,
        title.offsetTop + (title.offsetHeight - bullet.offsetHeight) / 2,
      );
      // Written to the DOM directly so the layout is correct in the same task as the commit.
      spacer.style.height = `${next}px`;
    };

    measure();

    window.addEventListener("resize", measure);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    const title = titleRef?.current;
    if (title) observer?.observe(title);
    if (title?.parentElement) observer?.observe(title.parentElement);
    let active = true;
    document.fonts?.ready.then(() => active && measure());

    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [titleRef]);

  return (
    <div className="flex h-auto flex-col items-center justify-start">
      <div
        ref={spacerRef}
        className={clsx("w-0 grow-0", {
          "border-l-klerosUIComponentsStroke border-l": !isFirst,
        })}
      />
      <div ref={bulletRef} className="flex">
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
      </div>
      {line && (
        <div className="border-l-klerosUIComponentsStroke w-0 grow border-l" />
      )}
    </div>
  );
};

export default Spine;
