import React from "react";
import { cn } from "../utils";
import { Button, Link } from "react-aria-components";
import { clsx } from "clsx";

interface BreadcrumbProps {
  items: {
    text: React.ReactNode;
    value: any;
    /**
     * Makes the item a link (an `<a href>`) instead of a button. It is
     * ignored on the last item, which is the current page. In an app with a
     * router, wrap the app in react-aria's `RouterProvider` for client-side
     * navigation. `callback` is still called with `value`.
     */
    href?: string;
  }[];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback?: Function;
  clickable?: boolean;
  className?: string;
  variant?: "primary" | "secondary";
  /**
   * The element to render. `"nav"` makes the breadcrumb a navigation landmark.
   * @default div
   */
  as?: "div" | "nav";
  /**
   * The landmark name, used when `as` is `"nav"`.
   * @default Breadcrumb
   */
  "aria-label"?: string;
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
  as: Root = "div",
  "aria-label": ariaLabel = "Breadcrumb",
}: Readonly<BreadcrumbProps>) {
  return (
    <Root
      aria-label={Root === "nav" ? ariaLabel : undefined}
      className={cn(
        "box-border flex flex-wrap items-center gap-y-0.5",
        className,
      )}
    >
      {items.map(({ text, value, href }, i) => {
        if (i === items.length - 1)
          return (
            <Content
              className="text-klerosUIComponentsPrimaryText text-base font-semibold"
              aria-current="page"
              {...{ variant }}
              key={`${text}-${i}`}
            >
              {text}
            </Content>
          );
        const item = (
          <Content
            className={clsx(
              (clickable || href !== undefined) &&
                "hover:text-klerosUIComponentsPrimaryText",
            )}
            {...{ variant }}
          >
            {text}
          </Content>
        );
        const onPress = () => (callback ? callback(value) : null);
        return (
          <React.Fragment key={`${text}-${i}`}>
            {href === undefined ? (
              <Button
                className={clsx(clickable ? "cursor-pointer" : "cursor-text")}
                {...{ onPress }}
              >
                {item}
              </Button>
            ) : (
              <Link className="cursor-pointer" {...{ href, onPress }}>
                {item}
              </Link>
            )}
            <Content className="mx-2" {...{ variant }}>
              {"/"}
            </Content>
          </React.Fragment>
        );
      })}
    </Root>
  );
}

export default Breadcrumb;
