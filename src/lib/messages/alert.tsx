import React from "react";
import styled, { css } from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";

type VariantProp = { variant: "success" | "warning" | "error" | "info" };

const variantColor = css<VariantProp>`
  ${({ theme, variant }) => {
    if (variant === "success") return theme.success;
    if (variant === "warning") return theme.warning;
    if (variant === "error") return theme.error;
    return theme.primaryBlue;
  }}
`;

const Wrapper = styled.div<VariantProp>`
  min-width: 328px;
  width: fit-content;
  height: fit-content;
  background: ${({ theme }) => theme.whiteBackground};s
  border: 1px solid ${variantColor};
  border-radius: 3px;
  padding: 16px 24px;
  display: flex;
  align-items: center;

  svg {
    height: 24px;
    width: 24px;
    fill: ${variantColor};
  }
`;

const Text = styled.div<VariantProp>`
  margin-left: 16px;
  h2 {
    color: ${variantColor};
  }
  small {
    color: ${({ theme }) => theme.primaryText};
  }
`;

interface AlertProps extends VariantProp {
  title: string;
  msg: string;
}

const Alert: React.FC<AlertProps> = ({ variant, title, msg }) => (
  <Wrapper variant={variant}>
    {variant === "success" && <SuccessIcon />}
    {variant === "warning" && <WarningIcon />}
    {variant === "error" && <ErrorIcon />}
    {variant === "info" && <InfoIcon />}
    <Text variant={variant}>
      <h2>{title}</h2>
      <small>{msg}</small>
    </Text>
  </Wrapper>
);

export default Alert;
