import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "../../utils";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import ButtonText from "./ButtonText";
import KlerosSymbol from "./KlerosSymbol";
import ButtonIcon from "./ButtonIcon";

export interface BaseButtonProps {
  /** @default primary */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Reduce the paddings on button
   * @default false
   */
  small?: boolean;
  /**
   * Indicate if button is in loading state
   * @default false
   */
  isLoading?: boolean;
}

export interface ButtonProps
  extends AriaButtonProps,
    Omit<BaseButtonProps, "$loading"> {
  /**
   * The button label. Pass the label here; it is shown unless `children` is
   * set, and then it is the accessible name instead (unless `aria-label` is
   * passed), so keep it a plain-text description of the button.
   * Use `onPress` (react-aria) for clicks and `isDisabled` to disable.
   * @example <Button text="Submit" onPress={submit} isLoading={pending} />
   */
  text: string;
  /**
   * Content shown instead of `text`, for a rich label or an icon-only button.
   * @example <Button text="Close" children={<CloseIcon />} onPress={close} />
   */
  children?: AriaButtonProps["children"];
  /** The native tooltip of the button. Set on the element by the library: react-aria drops `title`. */
  title?: string;
  /** A React svg element to show as icon on button */
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  /** A React node element to show as is on button */
  icon?: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    text,
    children,
    title,
    variant,
    Icon,
    icon,
    isLoading,
    className,
    isDisabled,
    ...props
  },
  forwardedRef,
): React.ReactElement {
  // react-aria-components filters DOM props down to id, data-* and labelling
  // attributes, so `title` is set on the element after render instead.
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const setRefs = useCallback(
    (element: HTMLButtonElement | null) => {
      buttonRef.current = element;
      if (typeof forwardedRef === "function") forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef],
  );
  useEffect(() => {
    const element = buttonRef.current;
    if (!element || title === undefined) return;
    element.title = title;
    return () => element.removeAttribute("title");
  }, [title]);

  const isPrimary = variant === "primary" || variant === undefined;
  const isSecondary = variant === "secondary";
  const isTertiary = variant === "tertiary";
  return (
    <AriaButton
      className={cn(
        "relative box-border size-fit",
        "flex flex-row items-center justify-center",
        "rounded-base hover:cursor-pointer",
        "ease-ease transition-[background] duration-(--klerosUIComponentsTransitionSpeed)",
        "pressed:scale-95 transform transition-transform",

        props.small ? "px-6 py-1.5" : "px-8 py-[11.5px]",
        isPrimary && [
          "bg-klerosUIComponentsPrimaryBlue hover:bg-klerosUIComponentsSecondaryBlue",
        ],
        isSecondary && [
          "bg-klerosUIComponentsWhiteBackground hover:bg-klerosUIComponentsMediumBlue",
          "border-klerosUIComponentsPrimaryBlue border",
          props.small ? "px-[23px] py-[5px]" : "px-[31px] py-[10.5px]",
        ],
        isTertiary && [
          "bg-klerosUIComponentsSecondaryPurple hover:bg-klerosUIComponentsPrimaryPurple",
        ],
        isDisabled && [
          "bg-klerosUIComponentsLightGrey hover:bg-klerosUIComponentsLightGrey hover:cursor-not-allowed",
          isSecondary && "border-klerosUIComponentsStroke border",
        ],
        className,
      )}
      {...{ variant, isLoading, isDisabled, ...props }}
      ref={setRefs}
      aria-label={
        props["aria-label"] ?? (children === undefined ? undefined : text)
      }
    >
      {(values) => (
        <>
          {isLoading && <KlerosSymbol {...{ isDisabled, variant }} />}
          <ButtonIcon {...{ icon, Icon, isDisabled, isLoading, variant }} />
          <ButtonText {...{ isLoading, isDisabled, variant, text }}>
            {typeof children === "function" ? children(values) : children}
          </ButtonText>
        </>
      )}
    </AriaButton>
  );
});

export default Button;
