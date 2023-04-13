import React from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

export type VariantProp = { variant?: "accepted" | "refused" };

export const variantColor = css<VariantProp>`
  ${({ variant, theme }) => {
    if (variant === "accepted") return theme.klerosUIComponentsSuccess;
    if (variant === "refused") return theme.klerosUIComponentsError;
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
}

const Spine: React.FC<SpineProps> = ({ variant, line }) => (
  <Wrapper>
    <Circle {...{ variant }} />
    {line && <Line />}
  </Wrapper>
);

export default Spine;
