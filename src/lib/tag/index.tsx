import React from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { cn } from "../../utils";
import { hasContent } from "../../utils/has-content";
import clsx from "clsx";

interface BaseTagProps extends ButtonProps {
  active?: boolean;
  /**
   * Make the tag a toggle: `active` is announced as `aria-pressed`, so
   * assistive technology reads the state that the border only shows.
   * @default false
   */
  toggle?: boolean;
}

interface TagProps extends BaseTagProps {
  /**
   * The tag label. When `children` is set, it is not shown and is the
   * accessible name instead (unless `aria-label` is passed).
   */
  text: string;
  /** Content shown instead of `text`, e.g. a colour dot next to a label. */
  children?: ButtonProps["children"];
}

function Tag({
  text,
  active,
  toggle,
  children,
  className,
  ...props
}: Readonly<TagProps>) {
  return (
    <Button
      {...props}
      aria-label={
        props["aria-label"] ?? (hasContent(children) ? text : undefined)
      }
      aria-pressed={toggle ? !!active : props["aria-pressed"]}
      className={cn(
        "bg-klerosUIComponentsMediumBlue box-border h-8",
        "rounded-[300px] hover:cursor-pointer",
        "flex items-center justify-center px-4",
        active && ["border-klerosUIComponentsPrimaryBlue border"],
        className,
      )}
    >
      {(values) => {
        // Resolve a render function first; false, null and undefined fall back to text, in a <p> as before
        const content =
          typeof children === "function" ? children(values) : children;
        const rich = hasContent(content);
        const Label = rich ? "span" : "p";
        return (
          <Label
            className={clsx(
              "hover-short-transition text-klerosUIComponentsPrimaryBlue text-base",
              !active && ["hover:text-klerosUIComponentsSecondaryBlue"],
            )}
          >
            {rich ? content : text}
          </Label>
        );
      }}
    </Button>
  );
}

export default Tag;
