import React from "react";
import styled from "styled-components";
import Calendar from "../../../assets/svgs/form/calendar.svg";
import { button, p } from "../../../styles/common-style";

const StyledButton = styled.button`
  ${button}
  height: 45px;
  width: 330px;
  background: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  border-radius: 3px;
  padding: 0px 16px;

  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const StyledDate = styled.p`
  ${p}
`;

const StyledCalendar = styled(Calendar)`
  position: absolute;
  right: 16px;
  height: 16px;
  width: 16px;

  fill: ${({ theme }) => theme.klerosUIComponentsStroke};
`;

interface IDisplayButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  date: Date;
  time?: boolean;
}

const DisplayButton: React.FC<IDisplayButton> = ({ onClick, date, time }) => (
  <StyledButton {...{ onClick }}>
    <StyledDate>
      {date.toLocaleDateString()}
      {time &&
        `, ${date.getHours().toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}:${date.getMinutes().toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })} Local time`}
    </StyledDate>
    <StyledCalendar />
  </StyledButton>
);

export default DisplayButton;
