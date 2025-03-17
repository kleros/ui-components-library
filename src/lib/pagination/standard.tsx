import React from "react";
import usePagination from "../../hooks/pagination/use-pagination";
import Arrow from "../../assets/svgs/arrows/light-left.svg";
import { cn } from "../../utils";
import { Button, type ButtonProps } from "react-aria-components";
import clsx from "clsx";

const PageButton: React.FC<ButtonProps & { selected?: boolean }> = ({
  children,
  selected,
  className,
  ...props
}) => (
  <Button
    {...props}
    className={cn(
      "rounded-base m-1 h-8 w-8 border",
      "flex items-center justify-center text-sm",
      "hover:cursor-pointer hover:disabled:cursor-default",
      selected
        ? [
            "bg-klerosUIComponentsLightBlue hover:enabled:bg-klerosUIComponentsWhiteBackground",
            "border-klerosUIComponentsPrimaryBlue hover:enabled:border-klerosUIComponentsPrimaryBlue",
            "text-klerosUIComponentsPrimaryBlue hover:enabled:text-klerosUIComponentsPrimaryBlue",
          ]
        : [
            "bg-klerosUIComponentsWhiteBackground hover:enabled:bg-klerosUIComponentsLightBlue",
            "border-klerosUIComponentsStroke hover:enabled:border-klerosUIComponentsSecondaryBlue",
            "text-klerosUIComponentsPrimaryText hover:enabled:text-klerosUIComponentsSecondaryBlue",
          ],
      className,
    )}
  >
    {children}
  </Button>
);
interface StandardPaginationProps {
  currentPage: number;
  numPages: number;
  callback: (newPage: number) => void;
  className?: string;
  disableNumbers?: boolean;
  hideNumbers?: boolean;
}

const StandardPagination: React.FC<StandardPaginationProps> = ({
  currentPage,
  numPages,
  callback,
  disableNumbers,
  hideNumbers,
  className,
}) => {
  const [
    {
      incrementPage,
      decrementPage,
      goToPage,
      minPageReached,
      maxPageReached,
      getPageRange,
    },
  ] = usePagination(currentPage, numPages, callback);

  return (
    <div
      className={cn("box-border flex items-center justify-center", className)}
    >
      <PageButton
        isDisabled={minPageReached}
        onPress={decrementPage}
        className="hover:enabled:[&>svg]:fill-klerosUIComponentsSecondaryBlue"
      >
        <Arrow
          className={clsx(
            "ease-ease pr-0.25 transition-[fill]",
            minPageReached
              ? ["fill-klerosUIComponentsStroke"]
              : ["fill-klerosUIComponentsPrimaryText"],
          )}
        />
      </PageButton>
      {!hideNumbers &&
        getPageRange().map((i) => (
          <PageButton
            key={i}
            selected={currentPage === i}
            onPress={() => goToPage(i)}
            isDisabled={disableNumbers}
          >
            {i}
          </PageButton>
        ))}
      <PageButton
        isDisabled={maxPageReached}
        onPress={incrementPage}
        className="hover:enabled:[&>svg]:fill-klerosUIComponentsSecondaryBlue"
      >
        <Arrow
          className={cn(
            "ease-ease rotate-180 pl-0.25 transition-[fill]",
            maxPageReached
              ? ["fill-klerosUIComponentsStroke"]
              : ["fill-klerosUIComponentsPrimaryText"],
          )}
        />
      </PageButton>
    </div>
  );
};

export default StandardPagination;
