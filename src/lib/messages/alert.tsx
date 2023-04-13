import React from "react";
import styled, { css } from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";
import { borderBox, svg, h2, small } from "../../styles/common-style";

type VariantProp = { variant: "success" | "warning" | "error" | "info" };

const variantColor = css<VariantProp>`
  ${({ theme, variant }) => {
    if (variant === "success") return theme.klerosUIComponentsSuccess;
    if (variant === "warning") return theme.klerosUIComponentsWarning;
    if (variant === "error") return theme.klerosUIComponentsError;
    return theme.klerosUIComponentsPrimaryBlue;
  }}
`;

const StyledSVG = styled.svg``;

const Wrapper = styled.div<VariantProp>`
  ${borderBox}
  min-width: 328px;
  width: fit-content;
  height: fit-content;
  background: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  border: 1px solid ${variantColor};
  border-radius: 3px;
  padding: 16px 24px;
  display: flex;
  align-items: center;

  & ${StyledSVG} {
    ${svg}
    height: 24px;
    width: 24px;
    fill: ${variantColor};
  }
`;

const StyledTitle = styled.h2<VariantProp>`
  ${h2}
  color: ${variantColor};
`;

const StyledMessage = styled.small`
  ${small}
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

const Text = styled.div<VariantProp>`
  margin-left: 16px;
`;

interface AlertProps extends VariantProp {
  title: string;
  msg: string;
}

const Alert: React.FC<AlertProps> = ({ variant, title, msg }) => (
  <Wrapper variant={variant}>
    {variant === "success" && (
      <SuccessIcon className={StyledSVG.styledComponentId} />
    )}
    {variant === "warning" && (
      <WarningIcon className={StyledSVG.styledComponentId} />
    )}
    {variant === "error" && (
      <ErrorIcon className={StyledSVG.styledComponentId} />
    )}
    {variant === "info" && <InfoIcon className={StyledSVG.styledComponentId} />}
    <Text {...{ variant }}>
      <StyledTitle {...{ variant }}>{title}</StyledTitle>
      <StyledMessage>{msg}</StyledMessage>
    </Text>
  </Wrapper>
);

export default Alert;
