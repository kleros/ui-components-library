import React, { ReactNode } from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  FieldError,
  type FieldErrorProps,
  Label,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
  type RadioRenderProps,
} from "react-aria-components";
import { cn } from "../../utils";

export { RadioIndicator } from "./radio-indicator";

interface CustomRadioItemProps extends Omit<AriaRadioProps, "className"> {
  className?: string;
}

/** A single radio whose content is fully owned by the caller. Use the render-prop
 *  `children` to receive `{ isSelected, isHovered, isFocusVisible, ... }` and compose your
 *  own UI (cards, labels, ...), placing a `<RadioIndicator>` where you want it. Renders a
 *  `<label>`, so never nest interactive controls inside it — render adornments (a help
 *  tooltip) and conditional content (a field) as siblings within the `<CustomRadio>`. */
export function CustomRadioItem({
  className,
  children,
  ...props
}: Readonly<CustomRadioItemProps>) {
  return (
    <AriaRadio
      {...props}
      className={cn(
        "relative box-border block cursor-pointer",
        "text-klerosUIComponentsPrimaryText disabled:text-klerosUIComponentsStroke disabled:cursor-default",
        className,
      )}
    >
      {children}
    </AriaRadio>
  );
}

export interface CustomRadioOption
  extends Omit<AriaRadioProps, "children" | "className"> {
  /** Custom content for this option. A function receives the react-aria render props. */
  content: ReactNode | ((renderProps: RadioRenderProps) => ReactNode);
  className?: string;
}

export interface CustomRadioProps
  extends Omit<AriaRadioGroupProps, "children" | "className"> {
  /** Convenience API for simple option lists. For per-row adornments or content
   *  interleaved between options, use `children` (compose `<CustomRadioItem>`s) instead. */
  items?: CustomRadioOption[];
  children?: ReactNode;
  /** Group label rendered above the options. */
  groupLabel?: string;
  className?: string;
  /** Props for field error display.
   * [See FieldErrorProps](https://react-spectrum.adobe.com/react-aria/RadioGroup.html#fielderror) */
  fieldErrorProps?: FieldErrorProps;
}

/** A radio group whose options render arbitrary content (cards, tooltip-wrapped labels, ...)
 *  while keeping react-aria's `RadioGroup` semantics (single-select, roving tab-index,
 *  keyboard navigation, `role="radiogroup"`). Pass `items` for simple lists, or `children`
 *  (compose `<CustomRadioItem>`s, with adornments/fields as siblings) for richer layouts.
 *  For the plain label-only case, use `Radio` (the `options`-based group) instead.
 *  [Extends AriaRadioGroupProps](https://react-spectrum.adobe.com/react-aria/RadioGroup.html#radiogroup-1) */
function CustomRadio({
  groupLabel,
  className,
  fieldErrorProps,
  items,
  children,
  ...props
}: Readonly<CustomRadioProps>) {
  return (
    <AriaRadioGroup
      {...props}
      className={cn(
        "relative flex flex-col gap-2",
        "orientation-horizontal:flex-row orientation-horizontal:items-center orientation-horizontal:gap-4",
        className,
      )}
    >
      {groupLabel && (
        <Label className="text-klerosUIComponentsSecondaryText text-base">
          {groupLabel}
        </Label>
      )}
      {children ??
        items?.map(({ content, className: itemClassName, ...item }) => (
          <CustomRadioItem
            key={String(item.value)}
            {...item}
            className={itemClassName}
          >
            {content}
          </CustomRadioItem>
        ))}
      <FieldError
        {...fieldErrorProps}
        className={cn(
          "text-klerosUIComponentsError self-end text-sm",
          fieldErrorProps?.className,
        )}
      />
    </AriaRadioGroup>
  );
}

export default CustomRadio;
