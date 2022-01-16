import React, { ReactNode } from "react";
import styled, { css, keyframes } from "styled-components";
import HourglassIcon from "../../../assets/svgs/hourglass.svg";

interface LineBaseProps {
  animated?: boolean;
  width: number;
}

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

const BarTimerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LinearChart = styled.svg<LineBaseProps>`
  stroke: ${({ width }) => width};
  display: block;
  margin: 10px auto;
`;

const LineBackground = styled.path`
  stroke: ${({ theme }) => theme.stroke};
`;

const Line = styled.path<LineBaseProps>`
  stroke: ${({ theme }) => theme.success};
  ${({ animated, width }) =>
    animated &&
    css`
      animation: ${progressAnimation(width)} 1s ease-out forwards;
    `}
`;

const TimerMessage = styled.div`
  line-height: 1em;
  margin-top: 5px;
  color: ${({ theme }) => theme.error};
  font-weight: 600;
  fill: ${({ theme }) => theme.error};

  svg {
    margin-right: 9.75px;
  }
`;

interface LinearProps extends LineBaseProps {
  text?: string;
  progress: number;
  timerText?: ReactNode;
}

const Linear: React.FC<LinearProps> = ({
  text,
  progress,
  width,
  timerText,
  animated = true,
}) => {
  const sw = 8;
  const linePath = `M ${sw / 2} ${sw / 2} h ${width - sw}`;

  return (
    <Wrapper>
      {text && <p>{text}</p>}
      <BarTimerWrapper>
        <LinearChart
          width={width}
          height={sw}
          fill="none"
          strokeWidth={sw}
          strokeLinecap="round"
        >
          <LineBackground d={linePath} />
          {progress && (
            <Line
              animated={animated}
              width={width}
              strokeDasharray={`${(progress * width) / 100} ${width}`}
              d={linePath}
            />
          )}
        </LinearChart>
        {timerText && (
          <TimerMessage>
            <HourglassIcon />
            {timerText}
          </TimerMessage>
        )}
      </BarTimerWrapper>
    </Wrapper>
  );
};

export default Linear;
