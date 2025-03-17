import React, { ReactNode } from "react";
import usePagination from "../../hooks/pagination/use-pagination";
import Arrow from "../../assets/svgs/arrows/circle-left.svg";
import SolidErrorIcon from "../../assets/svgs/status-icons/solid-error.svg";
import { cn } from "../../utils";
import { Button, type ButtonProps } from "react-aria-components";
import clsx from "clsx";

const ArrowButton: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      className={cn(
        "h-6 w-6 rounded-full bg-none hover:enabled:cursor-pointer hover:disabled:cursor-default",
        "[&>svg]:ease-ease [&>svg]:h-6 [&>svg]:w-6 [&>svg]:transition-[fill]",
        ":hover:enabled:[&>svg]:fill-klerosUIComponentsSecondaryBlue",
        props.isDisabled
          ? ["[&>svg]:fill-klerosUIComponentsStroke"]
          : ["[&>svg]:fill-klerosUIComponentsPrimaryBlue"],
        className,
      )}
      {...props}
    >
      {props.children}
    </Button>
  );
};

interface CompactPaginationProps {
  currentPage: number;
  numPages: number;
  callback: (newPage: number) => void;
  /** Callback function called when end of pages has been reached */
  onCloseOnLastPage?: () => void;
  label?: ReactNode;
  className?: string;
}

function CompactPagination({
  currentPage,
  numPages,
  callback,
  onCloseOnLastPage,
  label,
  className,
}: Readonly<CompactPaginationProps>) {
  const [{ incrementPage, decrementPage, minPageReached, maxPageReached }] =
    usePagination(currentPage, numPages, callback, onCloseOnLastPage);

  return (
    <div className={cn("box-border flex items-center justify-end", className)}>
      <small className="text-klerosUIComponentsPrimaryText text-sm">
        {label}
      </small>
      <ArrowButton
        className={clsx(label && "ml-4")}
        isDisabled={minPageReached}
        onPress={decrementPage}
      >
        <Arrow />
      </ArrowButton>
      {currentPage === numPages && onCloseOnLastPage ? (
        <ArrowButton className="ml-2" onPress={onCloseOnLastPage}>
          <SolidErrorIcon
            className={clsx(
              "fill-klerosUIComponentsPrimaryBlue",
              "hover:enabled:fill-klerosUIComponentsSecondaryBlue",
            )}
          />
        </ArrowButton>
      ) : (
        <ArrowButton
          className={"ml-2"}
          isDisabled={maxPageReached}
          onPress={incrementPage}
        >
          <Arrow className="rotate-180" />
        </ArrowButton>
      )}
    </div>
  );
}

export default CompactPagination;
