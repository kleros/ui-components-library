import React from "react";
import styled from "styled-components";
import LeftArrow from "../../../assets/svgs/arrows/simple-left.svg";

const Wrapper = styled.div`
  width: 100%;
  height: 64px;
  padding: 24px;
  display: flex;
  justify-content: space-between;

  h2 {
    user-select: none;
  }
`;

const StyledArrow = styled(LeftArrow)`
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.primaryBlue};
  transition: fill ease ${({ theme }) => theme.transitionSpeed};

  :hover {
    fill: ${({ theme }) => theme.secondaryBlue};
  }
`;
const RightArrow = styled(StyledArrow)`
  transform: rotate(180deg);
`;

const UnstyledButton = styled.button`
  background: none;
  padding: 0;
`;

export interface IMonthSelector {
  monthLabel: string;
  goToPreviousMonths: () => void;
  goToNextMonths: () => void;
}

const MonthSelector: React.FC<IMonthSelector> = ({
  monthLabel,
  goToNextMonths,
  goToPreviousMonths,
}) => (
  <Wrapper>
    <UnstyledButton onClick={goToPreviousMonths}>
      <StyledArrow />
    </UnstyledButton>
    <h2>{monthLabel}</h2>
    <UnstyledButton onClick={goToNextMonths}>
      <RightArrow />
    </UnstyledButton>
  </Wrapper>
);

export default MonthSelector;
