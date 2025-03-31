import React from "react";
import clsx from "clsx";
import SuccessIcon from "../../../assets/svgs/status-icons/success.svg";

interface BulletCircleProps {
  active?: boolean;
  completed?: boolean;
  line?: boolean;
  index: number;
}

const BulletCircle: React.FC<BulletCircleProps> = ({
  active,
  completed,
  line,
  index,
}) => (
  <div className="flex h-full flex-col items-center justify-start">
    {completed ? (
      <SuccessIcon className="fill-klerosUIComponentsPrimaryBlue size-6 basis-auto" />
    ) : (
      <div
        className={clsx(
          "size-6 basis-auto rounded-xl border",
          "flex items-center justify-center",
          active
            ? "bg-klerosUIComponentsPrimaryBlue border-klerosUIComponentsPrimaryBlue"
            : "border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground",
        )}
      >
        <span
          className={clsx(
            "text-xs",
            active
              ? "text-klerosUIComponentsWhiteBackground"
              : "text-klerosUIComponentsStroke",
          )}
        >
          {index}
        </span>
      </div>
    )}
    {line && (
      <div
        className={clsx(
          "my-2 h-auto w-0 grow border-l",
          completed
            ? "border-l-klerosUIComponentsPrimaryBlue"
            : "border-l-klerosUIComponentsStroke",
        )}
      />
    )}
  </div>
);

export default BulletCircle;
