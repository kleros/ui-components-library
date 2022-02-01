import React from "react";
import styled from "styled-components";
import BulletCircle from "./bullet-circle";
import { h2 } from "../../../styles/common-style";

const StyledTitle = styled.h2``;

const Wrapper = styled.div<{ active?: boolean }>`
  flex-grow: 1;
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;

  & ${StyledTitle} {
    ${h2}
    font-size: 14px;
    line-height: 19px;
    margin-left: 8px;
    color: ${(props) =>
      props.active ? props.theme.primaryText : props.theme.secondaryText};
  }
`;

const Line = styled.div<{ completed?: boolean }>`
  height: 0px;
  width: auto;
  flex-grow: 1;
  border-top: 1px solid
    ${(props) =>
      props.completed ? props.theme.primaryBlue : props.theme.stroke};
  margin: 0px 16px;
`;

interface HorizontalBulletProps {
  index: number;
  title: string;
  active?: boolean;
  completed?: boolean;
  line?: boolean;
}

const HorizontalBullet: React.FC<HorizontalBulletProps> = ({
  index,
  title,
  active,
  completed,
  line,
  ...props
}) => (
  <Wrapper active={active} {...props}>
    <BulletCircle active={active} completed={completed} index={index} />
    <StyledTitle>{title}</StyledTitle>
    {line && <Line completed={completed} />}
  </Wrapper>
);

export default HorizontalBullet;
