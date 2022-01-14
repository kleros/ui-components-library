import React, { useRef, useContext } from "react";
import styled from "styled-components";
import { useDay } from "@datepicker-react/hooks";
import DatepickerContext from "./datepickerContext";

const StyledButton = styled.button<{ isSelected: boolean }>`
  height: 24px;
  width: 24px;
  border-radius: 12px;
  background-color: ${(props) =>
    props.isSelected ? props.theme.primaryBlue : props.theme.whiteBackground};
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  :hover {
    background-color: ${(props) =>
      props.isSelected ? props.theme.primaryBlue : props.theme.secondaryBlue};
    cursor: pointer;
    small {
      color: ${({ theme }) => theme.whiteBackground} !important;
    }
  }

  small {
    color: ${(props) =>
      props.isSelected
        ? props.theme.whiteBackground
        : props.theme.secondaryText} !important;
    font-weight: 600;
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
  return (
    <StyledButton
      ref={dayRef}
      {...{ isSelected, onClick, onKeyDown, onMouseEnter, tabIndex }}
    >
      <small>{dayLabel}</small>
    </StyledButton>
  );
};

export default Day;
