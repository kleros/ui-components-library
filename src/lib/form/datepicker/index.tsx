import React, { useState, useRef } from "react";
import styled from "styled-components";
import useFocusOutside from "../../../hooks/use-focus-outside";
import { useDatepicker, START_DATE } from "@datepicker-react/hooks";
import DatepickerContext from "./datepickerContext";
import DisplayButton from "./display-button";
import Dropdown from "./dropdown";
import { borderBox } from "../../../styles/common-style";

const PositionedContainer = styled.div`
  ${borderBox}
  position: relative;
`;

interface IDatePicker {
  onSelect: (date: Date) => void;
  time?: boolean;
}

const DatePicker: React.FC<IDatePicker> = ({ onSelect, time }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  const [date, setDate] = useState(new Date());
  const [hours, setHours] = useState(date.getHours());
  const [minutes, setMinutes] = useState(date.getMinutes());
  const {
    firstDayOfWeek,
    activeMonths,
    isDateSelected,
    isDateHovered,
    isFirstOrLastSelectedDate,
    isDateBlocked,
    isDateFocused,
    focusedDate,
    onDateHover,
    onDateSelect: handleDateSelect,
    onDateFocus,
    goToPreviousMonths,
    goToNextMonths,
  } = useDatepicker({
    startDate: date,
    endDate: date,
    focusedInput: START_DATE,
    onDatesChange: (date) => {
      if (date.startDate) {
        date.startDate.setHours(hours, minutes);
        setDate(date.startDate);
        onSelect(date.startDate);
      }
    },
    numberOfMonths: 1,
    minBookingDays: 1,
    exactMinBookingDays: true,
  });

  const onDateSelect = (date: Date) => {
    handleDateSelect(date);
    date.setHours(hours, minutes);
    setDate(date);
    onSelect(date);
  };

  const onTimeChange = (hours: number, minutes: number) => {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    setHours(hours);
    setMinutes(minutes);
    setDate(newDate);
    onSelect(newDate);
  };

  return (
    <DatepickerContext.Provider
      value={{
        focusedDate,
        isDateFocused,
        isDateSelected,
        isDateHovered,
        isDateBlocked,
        isFirstOrLastSelectedDate,
        onDateSelect,
        onDateFocus,
        onDateHover,
      }}
    >
      <PositionedContainer ref={containerRef}>
        <DisplayButton {...{ date, time }} onClick={() => setIsOpen(!isOpen)} />
        <Dropdown
          {...{
            ...activeMonths[0],
            isOpen,
            time,
            firstDayOfWeek,
            goToNextMonths,
            goToPreviousMonths,
            date,
            hours,
            minutes,
            setHours: (hours) => onTimeChange(hours, minutes),
            setMinutes: (minutes) => onTimeChange(hours, minutes),
            onSelect: () => {
              date.setHours(hours, minutes);
              onSelect(date);
              setIsOpen(false);
            },
          }}
        />
      </PositionedContainer>
    </DatepickerContext.Provider>
  );
};

export default DatePicker;
