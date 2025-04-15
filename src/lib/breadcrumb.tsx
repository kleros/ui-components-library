import React from "react";
import { cn } from "../utils";
import { Button } from "react-aria-components";
import { clsx } from "clsx";

interface BreadcrumbProps {
  items: { text: string; value: any }[];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback?: Function;
  clickable?: boolean;
  className?: string;
  variant?: "primary" | "secondary";
}

const Content: React.FC<
  React.ComponentProps<"small"> & { variant?: "primary" | "secondary" }
> = ({ children, className, variant, ...props }) => (
  <small
    className={cn(
      "ease-ease transition-colors",
      "text-klerosUIComponentsSecondaryText text-sm break-words",
      className,
      variant === "primary" && "text-klerosUIComponentsPrimaryBlue",
    )}
    {...props}
  >
    {children}
  </small>
);

function Breadcrumb({
  items,
  callback,
  clickable,
  className,
  variant,
}: Readonly<BreadcrumbProps>) {
  return (
    <div
      className={cn(
        "box-border flex flex-wrap items-center gap-y-0.5",
        className,
      )}
    >
      {items.map(({ text, value }, i) =>
        i === items.length - 1 ? (
          <Content
            className="text-klerosUIComponentsPrimaryText text-base font-semibold"
            {...{ variant }}
            key={`${text}-${i}`}
          >
            {text}
          </Content>
        ) : (
          <React.Fragment key={`${text}-${i}`}>
            <Button
              className={clsx(clickable ? "cursor-pointer" : "cursor-text")}
              onPress={() => (callback ? callback(value) : null)}
            >
              <Content
                className={clsx(
                  clickable && "hover:text-klerosUIComponentsPrimaryText",
                )}
                {...{ variant }}
              >
                {text}
              </Content>
            </Button>
            <Content className="mx-2" {...{ variant }}>
              {"/"}
            </Content>
          </React.Fragment>
        ),
      )}
    </div>
  );
}

export default Breadcrumb;
