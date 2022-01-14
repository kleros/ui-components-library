import React from "react";
import styled from "styled-components";
import Day from "./day";

const MonthContainer = styled.div`
  width: 330px;
  height: 220px;
  padding-top: 16px;
  display: flex;
  justify-content: center;
  border-top: 1px solid ${({ theme }) => theme.stroke};
  border-bottom: 1px solid ${({ theme }) => theme.stroke};
`;

const StyledMonth = styled.div`
  width: fit-content;
  height: fit-content;
  display: grid;
  grid-template-columns: repeat(7, 32px);

  div {
    height: 26px;
    width: 32px;
    display: flex;
    justify-content: center;
    align-items: center;

    small {
      color: ${({ theme }) => theme.primaryText};
      font-weight: 600;
      user-select: none;
    }
  }
`;

export interface IMonth {
  days: (number | { dayLabel: string; date: Date })[];
  weekdayLabels: string[];
}

const Month: React.FC<IMonth> = ({ days, weekdayLabels }) => (
  <MonthContainer>
    <StyledMonth>
      {weekdayLabels.map((dayLabel, i) => (
        <div key={i}>
          <small>{dayLabel}</small>
        </div>
      ))}
      {days.map((day, i) =>
        typeof day === "number" ? (
          <div key={i}></div>
        ) : (
          <div key={i}>
            <Day key={i} {...day} />
          </div>
        )
      )}
    </StyledMonth>
  </MonthContainer>
);

export default Month;
