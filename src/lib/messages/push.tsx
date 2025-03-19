import React from "react";
import SuccessIcon from "../../assets/svgs/status-icons/solid-success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/solid-error.svg";
import SyncIcon from "../../assets/svgs/status-icons/sync.svg";
import CloseIcon from "../../assets/svgs/status-icons/close.svg";
import { cn } from "../../utils";
import { Button } from "react-aria-components";

type SmallProp = { small?: boolean };
type VariantProp = { variant: "success" | "error" | "sync" };

interface PushProps extends SmallProp, VariantProp {
  title: string;
  msg?: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function;
  className?: string;
}

function Push({
  variant,
  title,
  msg,
  callback,
  small = false,
  className,
  ...props
}: Readonly<PushProps>) {
  return (
    <div
      className={cn(
        "bg-klerosUIComponentsPrimaryBlue relative box-border",
        "rounded-base flex items-center",
        "[&>svg]:fill-klerosUIComponentsWhiteBackground",
        small
          ? [
              "h-12 w-[300px] px-6 py-3",
              "[&>svg]:h-6 [&>svg]:min-h-6 [&>svg]:w-6 [&>svg]:min-w-6",
            ]
          : [
              "h-25 w-[422px] py-4 pr-8 pl-6",
              "[&>svg]:h-8 [&>svg]:min-h-8 [&>svg]:w-8 [&>svg]:min-w-8",
            ],
        className,
      )}
      {...{ small, ...props }}
    >
      {variant === "success" && <SuccessIcon />}
      {variant === "error" && <ErrorIcon />}
      {variant === "sync" && <SyncIcon />}
      <div className="ml-4">
        <h2 className="text-klerosUIComponentsWhiteBackground text-base font-semibold">
          {title}
        </h2>
        {!small && (
          <small className="text-klerosUIComponentsWhiteBackground text-sm font-normal">
            {msg}
          </small>
        )}
      </div>
      {!small && (
        <Button
          onPress={() => callback()}
          className="absolute top-6 right-6 inline-flex h-2 w-2 cursor-pointer bg-none p-0"
        >
          <CloseIcon className="fill-klerosUIComponentsWhiteBackground h-2 min-h-2 w-2 min-w-2" />
        </Button>
      )}
    </div>
  );
}

export default Push;
