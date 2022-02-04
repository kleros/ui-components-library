import React, { InputHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import { borderBox, svg } from "../../styles/common-style";

export type VariantProp = {
  variant?: "success" | "warning" | "error" | string;
};

export const variantColor = css<VariantProp>`
  ${({ variant, theme }) => {
    if (variant === "warning") return theme.warning;
    if (variant === "error") return theme.error;
    if (variant === "success") return theme.success;
    return theme.secondaryText;
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
  fill: ${(props) => props.theme.success};
`;

const StyledWarningIcon = styled(WarningIcon)`
  fill: ${(props) => props.theme.warning};
`;

const StyledErrorIcon = styled(ErrorIcon)`
  fill: ${(props) => props.theme.error};
`;

export const baseInputStyle = css<VariantProp>`
  height: 100%;
  width: 100%;
  background: ${(props) => props.theme.whiteBackground};
  border: 1px solid
    ${({ variant, theme }) => (variant ? variantColor : theme.stroke)};
  border-radius: 3px;

  color: ${(props) => props.theme.primaryText};

  :focus {
    outline: none;
    border: 1px solid ${(props) => props.theme.primaryBlue}40;
    box-shadow: 0px 0px 6px ${(props) => props.theme.primaryBlue};
    border-radius: 3px;
  }

  ::placeholder {
    color: ${(props) => props.theme.secondaryText};
  }
`;

const StyledInput = styled.input`
  padding: 0px 40px 0px 16px;
  ${baseInputStyle}
`;

export const StyledMessage = styled.small<VariantProp>`
  line-height: 1em;
  margin-top: 5px;
  margin-left: 16px;
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
    {message && <StyledMessage {...{ variant }}>{message}</StyledMessage>}
  </Wrapper>
);

Field.displayName = "Field";

export default Field;
