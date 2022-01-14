import React from "react";
import styled from "styled-components";
import TimeControls, { ITimeControls } from "./time-controls";
export type { ITimeControls };

const Wrapper = styled.div`
  width: 100%;
  height: 284px;
  border-left: 1px solid ${({ theme }) => theme.stroke};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;

  h2 {
    user-select: none;
  }
`;

const TimeSelector: React.FC<ITimeControls> = (props) => {
  return (
    <Wrapper>
      <Header>
        <h2>Time</h2>
      </Header>
      <TimeControls {...props} />
    </Wrapper>
  );
};

export default TimeSelector;
