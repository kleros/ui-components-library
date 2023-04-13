import React from "react";
import styled from "styled-components";
import Day from "./day";
import { small } from "../../../styles/common-style";

const MonthContainer = styled.div`
  width: 330px;
  height: 220px;
  padding-top: 16px;
  display: flex;
  justify-content: center;
  border-top: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  border-bottom: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
`;

const StyledGridContainer = styled.div`
  height: 26px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledWeekDay = styled.small`
  ${small}
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  font-weight: 600;
  user-select: none;
`;

const StyledMonth = styled.div`
  width: fit-content;
  height: fit-content;
  display: grid;
  grid-template-columns: repeat(7, 32px);
`;

export interface IMonth {
  days: (number | { dayLabel: string; date: Date })[];
  weekdayLabels: string[];
}

const Month: React.FC<IMonth> = ({ days, weekdayLabels }) => (
  <MonthContainer>
    <StyledMonth>
      {weekdayLabels.map((dayLabel, i) => (
        <StyledGridContainer key={i}>
          <StyledWeekDay>{dayLabel}</StyledWeekDay>
        </StyledGridContainer>
      ))}
      {days.map((day, i) =>
        typeof day === "number" ? (
          <StyledGridContainer key={i}></StyledGridContainer>
        ) : (
          <StyledGridContainer key={i}>
            <Day key={i} {...day} />
          </StyledGridContainer>
        )
      )}
    </StyledMonth>
  </MonthContainer>
);

export default Month;
