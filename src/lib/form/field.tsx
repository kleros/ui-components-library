import React, { InputHTMLAttributes, useRef } from "react";
import styled, { css } from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";
import UpArrowIcon from "../../assets/svgs/arrows/field-arrow-up.svg";
import DownArrowIcon from "../../assets/svgs/arrows/field-arrow-down.svg";

import { borderBox, small, svg } from "../../styles/common-style";
import { useHover } from "usehooks-ts";

export type VariantProp = {
  variant?: "success" | "warning" | "error" | string;
};

export const variantColor = css<VariantProp>`
  ${({ variant, theme }) => {
    if (variant === "warning") return theme.klerosUIComponentsWarning;
    if (variant === "error") return theme.klerosUIComponentsError;
    if (variant === "success") return theme.klerosUIComponentsSuccess;
    return theme.klerosUIComponentsSecondaryText;
  }}
`;

const Wrapper = styled.div`
  ${borderBox}
  height: 45px;
  width: 278px;
  position: relative;
  color: red;

  .field-svg {
    ${svg}
    height: 16px;
    width: 16px;
    position: absolute;
    top: 14px;
    right: 16px;
  }
`;

const StyledSuccessIcon = styled(SuccessIcon)`
  fill: ${(props) => props.theme.klerosUIComponentsSuccess};
`;

const StyledWarningIcon = styled(WarningIcon)`
  fill: ${(props) => props.theme.klerosUIComponentsWarning};
`;

const StyledErrorIcon = styled(ErrorIcon)`
  fill: ${(props) => props.theme.klerosUIComponentsError};
`;

export const baseInputStyle = css<VariantProp>`
  height: 100%;
  width: 100%;
  background: ${(props) => props.theme.klerosUIComponentsWhiteBackground};
  border: 1px solid
    ${({ variant, theme }) =>
      variant ? variantColor : theme.klerosUIComponentsStroke};
  border-radius: 3px;

  color: ${(props) => props.theme.klerosUIComponentsPrimaryText};

  :focus {
    outline: none;
    border: 1px solid ${(props) => props.theme.klerosUIComponentsPrimaryBlue}40;
    box-shadow: 0px 0px 6px
      ${(props) => props.theme.klerosUIComponentsPrimaryBlue};
    border-radius: 3px;
  }

  ::placeholder {
    color: ${(props) => props.theme.klerosUIComponentsSecondaryText};
    opacity: 0.5;
  }
`;

const StyledInput = styled.input<{
  variant?: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
}>`
  padding-top: 14px;
  padding-bottom: 14px;
  padding-left: 16px;
  padding-right: ${({ Icon, variant, type }) => {
    if (Icon) return type === "number" ? "64px" : "56px";
    if (variant) return type === "number" ? "52px" : "44px";
    return type === "number" ? "30px" : "16px";
  }};

  /* Chrome, Safari, Edge, Opera */
  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  -moz-appearance: textfield;
  appearance: textfield;
  ${baseInputStyle}
`;

const ArrowsContainer = styled.div<{
  variant?: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  height: 17px;
  width: 14px;
  top: 14px;
  right: ${({ Icon, variant }) => {
    if (Icon) return "48px";
    if (variant) return "36px";
    return "12px";
  }};
`;

const ArrowButton = styled.button`
  height: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;

  cursor: pointer;
  :hover {
    background: ${(props) => props.theme.klerosUIComponentsStroke};
  }
`;

const StyledArrowIcon = styled.svg`
  width: 8px;
  height: 8px;
  path {
    fill: ${(props) => props.theme.klerosUIComponentsSecondaryText};
  }
`;

const StyledSVG = styled.svg``;

export const StyledMessage = styled.small<VariantProp>`
  margin-top: 6px;
  display: flex;
  align-items: flex-start;

  & ${StyledSVG} {
    ${svg}
    min-width: 16px;
    max-width: 16px;
    margin-right: 8px;
    fill: ${variantColor};
  }
`;

const StyledSmall = styled.small`
  ${small}
  position: relative;
  text-align: justify;
  color: ${variantColor};
`;

const IconContainer = styled.div`
  display: flex;
  width: 44px;
  height: 43px;
  position: absolute;
  top: 1px;
  right: 1px;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.klerosUIComponentsLightBlue};
  border-left: 1px solid ${(props) => props.theme.klerosUIComponentsStroke};
`;

const StyledIconSVG = styled.svg`
  width: 24px;
  height: 24px;
`;

type FieldProps = VariantProp &
  InputHTMLAttributes<HTMLInputElement> & {
    message?: string;
    Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  };

const Field: React.FC<FieldProps> = ({
  variant,
  message,
  Icon,
  className,
  ...props
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hovering = useHover(wrapperRef);

  return (
    <Wrapper ref={wrapperRef} {...{ className }}>
      <StyledInput ref={inputRef} {...{ variant, Icon, ...props }} />
      {props.type === "number" && hovering && (
        <ArrowsContainer className="field-arrows" {...{ variant, Icon }}>
          <ArrowButton
            aria-label="increment"
            onClick={() => inputRef?.current?.stepUp()}
          >
            <StyledArrowIcon as={UpArrowIcon} />
          </ArrowButton>
          <ArrowButton aria-label="decrement">
            <StyledArrowIcon
              as={DownArrowIcon}
              onClick={() => inputRef?.current?.stepDown()}
            />
          </ArrowButton>
        </ArrowsContainer>
      )}
      {variant === "success" && <StyledSuccessIcon className="field-svg" />}
      {variant === "warning" && <StyledWarningIcon className="field-svg" />}
      {variant === "error" && <StyledErrorIcon className="field-svg" />}
      {Icon && (
        <IconContainer>
          <StyledIconSVG as={Icon} />
        </IconContainer>
      )}
      {message && (
        <StyledMessage {...{ variant }}>
          {variant === "info" && (
            <InfoIcon className={StyledSVG.styledComponentId} />
          )}
          <StyledSmall {...{ variant }}>{message}</StyledSmall>
        </StyledMessage>
      )}
    </Wrapper>
  );
};

Field.displayName = "Field";

export default Field;
