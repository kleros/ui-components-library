import React from "react";
import styled from "styled-components";
import SuccessIcon from "../../../assets/svgs/status-icons/success.svg";

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const StyledSuccess = styled(SuccessIcon)`
  height: 24px;
  width: 24px;
  flex-basis: auto;
  fill: ${(props) => props.theme.primaryBlue};
`;

const Circle = styled.div<{ active?: boolean }>`
  height: 24px;
  width: 24px;
  flex-basis: auto;
  background-color: ${(props) =>
    props.active ? props.theme.primaryBlue : props.theme.whiteBackground};
  border-radius: 12px;
  border: 1px solid
    ${(props) => (props.active ? props.theme.primaryBlue : props.theme.stroke)};

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 12px;
  color: ${(props) =>
    props.active ? props.theme.whiteBackground : props.theme.stroke};
`;

const Line = styled.div<{ completed?: boolean }>`
  height: auto;
  width: 0px;
  flex-grow: 1;
  border-left: 1px solid
    ${(props) =>
      props.completed ? props.theme.primaryBlue : props.theme.stroke};
  margin: 8px 0px;
`;

interface BulletCircleProps {
  active?: boolean;
  completed?: boolean;
  line?: boolean;
  index: number;
}

const BulletCircle: React.FC<BulletCircleProps> = ({
  active,
  completed,
  line,
  index,
  ...props
}) => (
  <Wrapper {...props}>
    {completed ? <StyledSuccess /> : <Circle active={active}> {index} </Circle>}
    {line && <Line completed={completed} />}
  </Wrapper>
);

export default BulletCircle;
