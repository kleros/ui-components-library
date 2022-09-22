import React from "react";
import styled from "styled-components";
import { StepsProps } from ".";
import Bullet from "./horizontal-bullet";
import { borderBox } from "../../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  width: 250px;
  display: flex;
  justify-content: center;
  align-items: start;
`;

const HorizontalSteps: React.FC<StepsProps<"horizontal">> = ({
  items,
  currentItemIndex,
  ...props
}) => (
  <Wrapper {...props}>
    {items.map((item, i) => (
      <Bullet
        {...item}
        completed={i < currentItemIndex}
        active={i === currentItemIndex}
        last={i + 1 === items.length}
        index={i + 1}
        key={i}
      />
    ))}
  </Wrapper>
);

export default HorizontalSteps;
