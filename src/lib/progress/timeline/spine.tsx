import React, { useEffect, useState } from "react";
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

const Line = styled.div<{ topHeight?: number }>`
  height: ${({ topHeight }) => (topHeight ? `${topHeight}px` : "auto")};
  width: 0px;
  flex-grow: ${({ topHeight }) => (topHeight ? 0 : 1)};
  border-left: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
`;

interface SpineProps extends VariantProp {
  active?: boolean;
  line?: boolean;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const Spine: React.FC<SpineProps> = ({ variant, line, Icon, titleRef }) => {
  const [topHeight, setTopHeight] = useState<number>();

  useEffect(() => {
    if (titleRef?.current) {
      setTopHeight(titleRef.current.offsetTop);
    }
  }, [titleRef]);

  return (
    <Wrapper>
      {topHeight ? <Line topHeight={topHeight} /> : null}
      {Icon ? <Icon /> : <Circle {...{ variant }} />}
      {line && <Line />}
    </Wrapper>
  );
};

export default Spine;
