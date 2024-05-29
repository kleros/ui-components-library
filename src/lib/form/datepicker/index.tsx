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
  const today = new Date();
  const lastSelectableDate = new Date(today);
  lastSelectableDate.setDate(today.getDate());

  const updateDateWithTime = (selectedDate: Date) => {
    if (selectedDate.toDateString() === lastSelectableDate.toDateString()) {
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes());
      setHours(now.getHours());
      setMinutes(now.getMinutes());
    } else {
      selectedDate.setHours(hours, minutes);
    }
    setDate(selectedDate);
    onSelect(selectedDate);
  };

  const {
    firstDayOfWeek,
    activeMonths,
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
    onDatesChange: (data) => {
      if (data.startDate) {
        updateDateWithTime(new Date(data.startDate));
      }
    },
    numberOfMonths: 1,
    minBookingDays: 1,
    exactMinBookingDays: true,
  });

  const onTimeChange = (newHours: number, newMinutes: number) => {
    const newDate = new Date(date);
    newDate.setHours(newHours, newMinutes);
    setHours(newHours);
    setMinutes(newMinutes);
    setDate(newDate);
    onSelect(newDate);
  };

  return (
    <DatepickerContext.Provider
      value={{
        focusedDate,
        isDateFocused,
        isDateSelected: (selectedDate) => {
          return (
            selectedDate.getDate() === date.getDate() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getFullYear() === date.getFullYear()
          );
        },
        isDateHovered,
        isDateBlocked,
        isFirstOrLastSelectedDate,
        onDateSelect: (selectedDate: Date) => {
          handleDateSelect(selectedDate);
          updateDateWithTime(selectedDate);
        },
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
            setHours: (newHours) => onTimeChange(newHours, minutes),
            setMinutes: (newMinutes) => onTimeChange(hours, newMinutes),
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
