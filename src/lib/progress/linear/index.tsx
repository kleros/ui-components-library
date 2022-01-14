import React from "react";
import styled, { keyframes } from "styled-components";

type OffProp = { off?: boolean };
type WidthProp = { width: number };

const progressAnimation = (width: number) => keyframes`
  0% {
    stroke-dasharray: 0 ${width};
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.stroke};
`;

const LinearChart = styled.svg`
  display: block;
  margin: 10px auto;
`;

const LineBackground = styled.path`
  stroke: ${({ theme }) => theme.stroke};
`;

const Line = styled.path<OffProp & WidthProp>`
  stroke: ${(props) => (props.off ? props.theme.offGrey : props.theme.success)};
  animation: ${({ width }) => progressAnimation(width)} 1s ease-out forwards;
`;

interface LinearProps extends OffProp, WidthProp {
  text?: string;
  progress: number;
}

const Linear: React.FC<LinearProps> = ({ text, progress, width, off }) => {
  const sw = 8;
  const linePath = `M ${sw / 2} ${sw / 2} h ${width - sw}`;

  return (
    <Wrapper>
      {text && <p>{text}</p>}
      <LinearChart
        width={width}
        height={sw}
        fill='none'
        strokeWidth={sw}
        strokeLinecap='round'
      >
        <LineBackground d={linePath} />
        {progress && (
          <Line
            width={width}
            strokeDasharray={`${(progress * width) / 100} ${width}`}
            off={off}
            d={linePath}
          />
        )}
      </LinearChart>
    </Wrapper>
  );
};

export default Linear;
