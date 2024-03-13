import React, { InputHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";
import { borderBox, small, svg } from "../../styles/common-style";

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
  padding-right: ${({ Icon, variant }) => {
    if (Icon) return "56px";
    if (variant) return "44px";
    return "16px";
  }};
  ${baseInputStyle}
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
}) => (
  <Wrapper {...{ className }}>
    <StyledInput {...{ variant, Icon, ...props }} />
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

Field.displayName = "Field";

export default Field;
