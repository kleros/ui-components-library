import React from "react";
import styled, { css } from "styled-components";
import TimeControls, { ITimeControls } from "./time-controls";
export type { ITimeControls };
import { h2, mobileStyle } from "../../../styles/common-style";

const Wrapper = styled.div`
  width: 118px;
  height: 284px;
  border-left: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  display: flex;
  flex-direction: column;

  ${mobileStyle(
    () => css`
      border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
      border-top: none;
      border-bottom: none;
    `,
  )}
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
