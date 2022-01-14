import React from "react";
import styled from "styled-components";
import { useMonth, FirstDayOfWeek } from "@datepicker-react/hooks";
import Month from "./month";
import MonthSelector, { IMonthSelector } from "./month-selector";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface IDateSelector extends Omit<IMonthSelector, "monthLabel"> {
  year: number;
  month: number;
  firstDayOfWeek: FirstDayOfWeek;
}

const DateSelector: React.FC<IDateSelector> = ({
  year,
  month,
  firstDayOfWeek,
  goToNextMonths,
  goToPreviousMonths,
}) => {
  const { days, weekdayLabels, monthLabel } = useMonth({
    year,
    month,
    firstDayOfWeek,
  });
  return (
    <Wrapper>
      <MonthSelector {...{ monthLabel, goToPreviousMonths, goToNextMonths }} />
      <Month {...{ days, weekdayLabels }} />
    </Wrapper>
  );
};

export default DateSelector;
