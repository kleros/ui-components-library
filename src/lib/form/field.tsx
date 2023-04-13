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
  }
`;

const StyledInput = styled.input`
  padding: 14px 40px 14px 16px;
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

type FieldProps = VariantProp &
  InputHTMLAttributes<HTMLInputElement> & { message?: string };

const Field: React.FC<FieldProps> = ({
  variant,
  message,
  className,
  ...props
}) => (
  <Wrapper {...{ className }}>
    <StyledInput {...{ variant, ...props }} />
    {variant === "success" && <StyledSuccessIcon className="field-svg" />}
    {variant === "warning" && <StyledWarningIcon className="field-svg" />}
    {variant === "error" && <StyledErrorIcon className="field-svg" />}
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
