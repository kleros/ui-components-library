import React, { useRef, useContext } from "react";
import styled from "styled-components";
import { useDay } from "@datepicker-react/hooks";
import DatepickerContext from "./datepickerContext";
import { button, small } from "../../../styles/common-style";

const StyledDayNumber = styled.small<{
  isSelected: boolean;
  disabledDate: boolean;
}>`
  ${small}
  color: ${(props) =>
    props.isSelected
      ? props.theme.klerosUIComponentsWhiteBackground
      : props.disabledDate
      ? props.theme.klerosUIComponentsStroke
      : props.theme.klerosUIComponentsSecondaryText} !important;
  font-weight: 600;
  cursor: ${(props) => (props.disabledDate ? "not-allowed" : "pointer")};
`;

const StyledButton = styled.button<{
  isSelected: boolean;
  disabledDate: boolean;
}>`
  ${button}
  height: 24px;
  width: 24px;
  border-radius: 12px;
  background-color: ${(props) =>
    props.isSelected
      ? props.theme.klerosUIComponentsPrimaryBlue
      : props.theme.klerosUIComponentsWhiteBackground};
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  :hover {
    background-color: ${(props) =>
      props.isSelected
        ? props.theme.klerosUIComponentsPrimaryBlue
        : props.disabledDate
        ? props.theme.klerosUIComponentsWhiteBackground
        : props.theme.klerosUIComponentsSecondaryBlue};
    & ${StyledDayNumber} {
      color: ${(props) =>
        props.disabledDate
          ? props.theme.klerosUIComponentsStroke
          : props.theme.klerosUIComponentsWhiteBackground} !important;
    }
  }
`;

interface IDay {
  date: Date;
  dayLabel: string;
}

const Day: React.FC<IDay> = ({ date, dayLabel }) => {
  const dayRef = useRef(null);
  const { isSelected, onClick, onKeyDown, onMouseEnter, tabIndex } = useDay({
    dayRef,
    date,
    ...useContext(DatepickerContext),
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = date.getTime() < today.getTime();

  const handleClick = () => {
    if (!isPastDate) {
      onClick();
    }
  };

  return (
    <StyledButton
      ref={dayRef}
      {...{
        isSelected,
        onClick: handleClick,
        onKeyDown,
        onMouseEnter,
        tabIndex,
        disabledDate: isPastDate,
      }}
    >
      <StyledDayNumber {...{ isSelected, disabledDate: isPastDate }}>
        {dayLabel}
      </StyledDayNumber>
    </StyledButton>
  );
};

export default Day;
