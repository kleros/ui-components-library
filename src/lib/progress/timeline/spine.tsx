import React from "react";
import styled, { css } from "styled-components";
import { VariantProp } from "./bullet";

const variantColor = css<VariantProp>`
  ${({ variant, theme }) => {
    if (variant === "accepted") return theme.success;
    if (variant === "refused") return theme.error;
    return theme.primaryBlue;
  }}
`;

const Wrapper = styled.div`
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const Circle = styled.div<VariantProp>`
  height: 16px;
  width: 16px;
  flex-basis: auto;
  background-color: ${(props) => props.theme.whiteBackground};
  border-radius: 8px;
  border: 2px solid ${variantColor};
`;

const Line = styled.div`
  height: auto;
  width: 0px;
  flex-grow: 1;
  border-left: 1px solid ${(props) => props.theme.stroke};
`;

interface SpineProps {
  variant?: "accepted" | "refused";
  active?: boolean;
  line?: boolean;
}

const Spine: React.FC<SpineProps> = ({ variant, active, line }) => (
  <Wrapper>
    <Circle
      variant={variant}
      //! active={active}
    />
    {line && <Line />}
  </Wrapper>
);

export default Spine;
