import React from "react";
import { cn } from "../../utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  round?: boolean;
  hover?: boolean;
}

function Card({ hover, round, className, ...props }: Readonly<CardProps>) {
  return (
    <div
      className={cn(
        "bg-klerosUIComponentsWhiteBackground box-border h-[200px] w-[328px]",
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
