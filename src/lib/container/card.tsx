import React from "react";
import { cn } from "../../utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  round?: boolean;
  hover?: boolean;
  /** Size to the content and the container instead of the fixed 328×200. */
  fluid?: boolean;
}

function Card({
  hover,
  round,
  fluid,
  className,
  ...props
}: Readonly<CardProps>) {
  return (
    <div
      className={cn(
        "bg-klerosUIComponentsWhiteBackground box-border",
        fluid ? "h-auto w-full" : "h-[200px] w-[328px]",
        "border-klerosUIComponentsStroke hover-short-transition shadow-default border",
        hover && "hover:bg-klerosUIComponentsLightGrey hover:cursor-pointer",
        round ? "rounded-[18px]" : "rounded-base",
        className,
      )}
      {...props}
    >
      {props.children}
    </div>
  );
}
export default Card;
