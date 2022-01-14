import React from "react";
import styled from "styled-components";
import Calendar from "../../../assets/svgs/form/calendar.svg";

const StyledButton = styled.button`
  height: 45px;
  width: 330px;
  background: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  padding: 0px 16px;

  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const StyledCalendar = styled(Calendar)`
  position: absolute;
  right: 16px;
  height: 16px;
  width: 16px;

  fill: ${({ theme }) => theme.stroke};
`;

interface IDisplayButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  date: Date;
  time?: boolean;
}

const DisplayButton: React.FC<IDisplayButton> = ({ onClick, date, time }) => (
  <StyledButton {...{ onClick }}>
    <p>
      {date.toLocaleDateString()}
      {time &&
        `, ${date.getHours().toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}:${date.getMinutes().toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })} Local time`}
    </p>
    <StyledCalendar />
  </StyledButton>
);

export default DisplayButton;
