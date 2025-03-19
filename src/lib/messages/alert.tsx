import React from "react";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";
import { cn } from "../../utils";
import clsx from "clsx";

type VariantProp = { variant: "success" | "warning" | "error" | "info" };

interface AlertProps extends VariantProp {
  title: string;
  msg: string;
  className?: string;
}

function Alert({ variant, title, msg, className }: Readonly<AlertProps>) {
  return (
    <div
      className={cn(
        "bg-klerosUIComponentsWhiteBackground rounded-base border",
        "grid grid-cols-[24px_auto] items-center gap-4 px-6 pt-4 pb-5",
        {
          "border-klerosUIComponentsSuccess": variant === "success",
          "border-klerosUIComponentsError": variant === "error",
          "border-klerosUIComponentsPrimaryBlue": variant === "info",
          "border-klerosUIComponentsWarning": variant === "warning",
        },
        className,
      )}
    >
      <div className="h-6 w-6">
        {variant === "success" && (
          <SuccessIcon className="fill-klerosUIComponentsSuccess" />
        )}
        {variant === "warning" && (
          <WarningIcon className="fill-klerosUIComponentsWarning" />
        )}
        {variant === "error" && (
          <ErrorIcon className="fill-klerosUIComponentsError" />
        )}
        {variant === "info" && (
          <InfoIcon className="fill-klerosUIComponentsPrimaryBlue" />
        )}
      </div>
      <div className="flex flex-col gap-2 md:gap-0">
        <h2
          className={clsx("text-base font-semibold", {
            "text-klerosUIComponentsSuccess": variant === "success",
            "text-klerosUIComponentsError": variant === "error",
            "text-klerosUIComponentsPrimaryBlue": variant === "info",
            "text-klerosUIComponentsWarning": variant === "warning",
          })}
        >
          {title}
        </h2>
        <small className="text-klerosUIComponentsPrimaryText font-normal">
          {msg}
        </small>
      </div>
    </div>
  );
}

export default Alert;
