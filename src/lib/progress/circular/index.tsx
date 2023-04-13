import React from "react";
import styled, { css, keyframes } from "styled-components";
import { borderBox, svg } from "../../../styles/common-style";

interface ProgressBaseProps {
  progress: number;
  animated?: boolean;
}

const progressAnimation = (circ: number) => keyframes`
  0% {
    stroke-dasharray: 0 ${circ};
  }
`;

const CircularChart = styled.svg`
  ${borderBox}
  ${svg}
  display: block;
  margin: 10px auto;
`;

const CircleBackground = styled.path`
  stroke: ${({ theme }) => theme.klerosUIComponentsStroke};
`;

const Circle = styled.path<ProgressBaseProps & { circ: number }>`
  stroke: ${(props) =>
    props.progress < 100
      ? props.theme.klerosUIComponentsPrimaryBlue
      : props.theme.klerosUIComponentsSuccess};
  ${({ animated, circ }) =>
    animated &&
    css`
      animation: ${progressAnimation(circ)} 1s ease-out forwards;
    `}
`;

const Percentage = styled.text`
  fill: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

interface CircularProps extends ProgressBaseProps {
  small?: boolean;
}

const Circular: React.FC<CircularProps> = ({
  progress,
  small,
  animated = true,
}) => {
  const width = small ? 80 : 120;
  const sw = width / 20; // stroke-width
  const rad = (width - sw) / 2 + 1;
  const dy = width - sw + 2;
  const circ = 2 * Math.PI * rad;

  const circlePath = `M ${(width + sw) / 2} ${sw / 2}
  a ${rad} ${rad} 0 0 1 0 ${dy}
  a ${rad} ${rad} 0 0 1 0 -${dy}`;

  return (
    <CircularChart
      fill="none"
      strokeWidth={sw}
      strokeLinecap="round"
      width={width + sw}
      height={width + sw}
    >
      <CircleBackground d={circlePath} />
      {progress && (
        <Circle
          strokeDasharray={`${(circ * progress) / 100} ${circ}`}
          progress={progress}
          d={circlePath}
          circ={circ}
          animated={animated}
        />
      )}
      <Percentage
        fontSize={small ? 16 : 24}
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="middle"
        x="50%"
        y="50%"
      >
        {progress}%
      </Percentage>
    </CircularChart>
  );
};

export default Circular;
