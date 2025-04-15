import React, { useRef } from "react";
import Spine, { VariantProp, colorRegex } from "./spine";
export type { VariantProp };
import clsx from "clsx";
import { cn, isUndefined } from "../../../utils";

export interface SideProp {
  rightSided?: boolean;
}

export interface StateProp {
  state?: "loading" | "disabled" | "active";
}

interface BulletProps extends VariantProp, SideProp, StateProp {
  title: string;
  party: string | React.ReactElement;
  subtitle: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  line?: boolean;
  isLast: boolean;
  className?: string;
}

const Bullet: React.FC<BulletProps> = (props) => {
  const { title, party, subtitle, className, ...restProps } = props;
  const { rightSided, variant, line, Icon, isLast, state } = restProps;
  const titleRef = useRef<HTMLHeadingElement>(null);

  return (
    <li
      className={cn(
        "relative flex opacity-100",
        rightSided ? "justify-start" : "justify-end",
        {
          "opacity-50": state === "disabled",
          "animate-loading": state === "loading",
        },
        className,
      )}
      aria-label={`Timeline item: ${title}`}
      aria-current={state === "active" ? "step" : undefined}
    >
      <Spine {...{ variant, line, Icon, titleRef }} />
      <div
        className={clsx(
          "flex flex-col gap-1 lg:gap-0.5",
          rightSided
            ? ["ml-4 lg:ml-5", "order-1 text-left"]
            : ["mr-4 lg:mr-5", "-order-1 text-right"],
          isLast ? "mb-0" : "mb-4 lg:mb-4.5",
        )}
      >
        <div
          className={clsx(
            "relative",
            "flex flex-row flex-wrap items-center gap-x-2 gap-y-1",
            rightSided ? "justify-start" : "justify-end",
          )}
        >
          <h2
            className={clsx(
              "text-klerosUIComponentsPrimaryText text-sm font-semibold",
              rightSided ? "order-1" : "order-2",
            )}
            aria-label={`Timeline item title: ${title}`}
            ref={titleRef}
          >
            {title}
          </h2>
          {typeof party === "string" ? (
            <p
              className={clsx(
                "text-sm font-normal break-words",
                rightSided ? "order-2" : "order-1",
                {
                  "text-klerosUIComponentsSuccess": variant === "accepted",
                  "text-klerosUIComponentsError": variant === "refused",
                  "text-klerosUIComponentsPrimaryBlue": isUndefined(variant),
                },
              )}
              style={
                variant && colorRegex.test(variant)
                  ? {
                      color: variant,
                    }
                  : undefined
              }
              aria-label={`Timeline item party: ${party}`}
            >
              {party}
            </p>
          ) : (
            <div
              className={clsx(
                "inline-flex max-h-8 overflow-hidden",
                rightSided ? "order-2" : "order-1",
              )}
              aria-label="Timeline item party element"
            >
              {party}
            </div>
          )}
        </div>
        <small
          className={clsx(
            "text-klerosUIComponentsSecondaryText text-xs break-words",
            rightSided ? "self-start" : "self-end",
          )}
          aria-label={`Timeline item date: ${subtitle}`}
        >
          {subtitle}
        </small>
      </div>
    </li>
  );
};

export default Bullet;
