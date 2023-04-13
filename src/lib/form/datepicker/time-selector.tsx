import React from "react";
import styled from "styled-components";
import TimeControls, { ITimeControls } from "./time-controls";
export type { ITimeControls };
import { h2 } from "../../../styles/common-style";

const Wrapper = styled.div`
  width: 100%;
  height: 284px;
  border-left: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledTitle = styled.h2`
  ${h2}
  user-select: none;
`;

const TimeSelector: React.FC<ITimeControls> = (props) => {
  return (
    <Wrapper>
      <Header>
        <StyledTitle>Time</StyledTitle>
      </Header>
      <TimeControls {...props} />
    </Wrapper>
  );
};

export default TimeSelector;
