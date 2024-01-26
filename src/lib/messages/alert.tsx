import React from "react";
import styled, { css } from "styled-components";
import { svg } from "../../styles/common-style";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";

type VariantProp = { variant: "success" | "warning" | "error" | "info" };

const variantColor = css<VariantProp>`
  ${({ theme, variant }) => {
    switch (variant) {
      case "success":
        return css`
          color: ${theme.klerosUIComponentsSuccess};
        `;
      case "warning":
        return css`
          color: ${theme.klerosUIComponentsWarning};
        `;
      case "error":
        return css`
          color: ${theme.klerosUIComponentsError};
        `;
      case "info":
      default:
        return css`
          color: ${theme.klerosUIComponentsPrimaryBlue};
        `;
    }
  }}
`;

const borderColor = ({
  theme,
  variant,
}: {
  theme: any;
  variant: VariantProp["variant"];
}) => {
  const colors = {
    success: theme.klerosUIComponentsSuccess,
    warning: theme.klerosUIComponentsWarning,
    error: theme.klerosUIComponentsError,
    info: theme.klerosUIComponentsPrimaryBlue,
  };
  return colors[variant];
};

const Wrapper = styled.div<VariantProp>`
  display: grid;
  grid-template-columns: 24px auto;
  gap: 16px;
  align-items: center;
  background: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  border: 1px solid ${({ theme, variant }) => borderColor({ theme, variant })};
  border-radius: 3px;
  padding: 16px 24px;
`;

const IconWrapper = styled.div<VariantProp>`
  ${variantColor}
  height: 24px;
  width: 24px;
  svg {
    ${svg}
    fill: currentColor;
  }
`;

const StyledTitle = styled.h2<VariantProp>`
  ${variantColor}
  font-size: 16px;
  margin: 0;
  font-weight: 600;
`;

const StyledMessage = styled.small`
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  font-weight: 400;
`;

interface AlertProps extends VariantProp {
  title: string;
  msg: string;
}

const Alert: React.FC<AlertProps> = ({ variant, title, msg }) => (
  <Wrapper variant={variant}>
    <IconWrapper variant={variant}>
      {variant === "success" && <SuccessIcon />}
      {variant === "warning" && <WarningIcon />}
      {variant === "error" && <ErrorIcon />}
      {variant === "info" && <InfoIcon />}
    </IconWrapper>
    <div>
      <StyledTitle variant={variant}>{title}</StyledTitle>
      <StyledMessage>{msg}</StyledMessage>
    </div>
  </Wrapper>
);

export default Alert;
