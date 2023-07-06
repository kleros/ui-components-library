import React from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const colorRegex = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");

export type VariantProp = { variant?: "accepted" | "refused" | string };

export const variantColor = css<VariantProp>`
  ${({ variant, theme }) => {
    if (variant === "accepted") return theme.klerosUIComponentsSuccess;
    if (variant === "refused") return theme.klerosUIComponentsError;
    if (variant && colorRegex.test(variant)) return variant;
    return theme.klerosUIComponentsPrimaryBlue;
  }}
`;

const Circle = styled.div<VariantProp>`
  height: 16px;
  width: 16px;
  flex-basis: auto;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  border-radius: 8px;
  border: 2px solid ${variantColor};
`;

const Line = styled.div`
  height: auto;
  width: 0px;
  flex-grow: 1;
  border-left: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
`;

interface SpineProps extends VariantProp {
  active?: boolean;
  line?: boolean;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
}

const Spine: React.FC<SpineProps> = ({ variant, line, Icon }) => (
  <Wrapper>
    {Icon ? <Icon /> : <Circle {...{ variant }} />}
    {line && <Line />}
  </Wrapper>
);

export default Spine;
