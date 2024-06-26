import React from "react";
import styled from "styled-components";
import LeftArrow from "../../../assets/svgs/arrows/simple-left.svg";
import { small, button, svg } from "../../../styles/common-style";

const TimeControl = styled.div`
  flex-grow: 1;
  border-top: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  border-bottom: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};

  display: flex;
  flex-direction: column;
`;

const TimeDisplay = styled.div`
  width: 100%;
  height: 64px;
  background-color: ${({ theme }) => theme.klerosUIComponentsMediumBlue};
  padding: 0px 24px;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTime = styled.small`
  ${small}
  font-weight: 600;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
  user-select: none;
`;

const TimeButtons = styled(TimeDisplay)`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
`;

const StyledArrow = styled(LeftArrow)`
  ${svg}
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
  transition: fill ease
    ${({ theme }) => theme.klerosUIComponentsTransitionSpeed};
`;

const UpArrow = styled(StyledArrow)`
  transform: rotate(90deg);
`;

const DownArrow = styled(StyledArrow)`
  transform: rotate(-90deg);
`;

const UnstyledButton = styled.button`
  ${button}
  background: none;
  padding: 0;

  :hover {
    & ${StyledArrow} {
      fill: ${({ theme }) => theme.klerosUIComponentsSecondaryBlue};
    }
  }
  :disabled {
    & ${StyledArrow} {
      fill: ${({ theme }) => theme.klerosUIComponentsStroke};
    }
  }
`;

export interface ITimeControls {
  date: Date;
  hours: number;
  minutes: number;
  setHours: (hours: number) => void;
  setMinutes: (minutes: number) => void;
}

const TimeControls: React.FC<ITimeControls> = ({
  date,
  hours,
  minutes,
  setHours,
  setMinutes,
}) => {
  const today = new Date();

  const disableHourUp = hours === 23;
  const disableMinuteUp = minutes === 59;

  const isToday = date.toDateString() === today.toDateString();
  const currentTime = today.getTime();
  const checkTime = new Date(date).setHours(hours - 1, minutes);

  const disableHourDown =
    hours === 0 ||
    (isToday &&
      (hours - 1 < today.getHours() ||
        (hours - 1 === today.getHours() && minutes <= today.getMinutes()) ||
        checkTime <= currentTime));

  const disableMinuteDown =
    minutes === 0 ||
    (isToday &&
      (hours < today.getHours() ||
        (hours === today.getHours() && minutes - 1 <= today.getMinutes())));

  return (
    <TimeControl>
      <TimeButtons>
        <UnstyledButton
          onClick={() => {
            const newHours = hours + 1;
            setHours(newHours);
            date.setHours(newHours, minutes);
          }}
          disabled={disableHourUp}
        >
          <UpArrow />
        </UnstyledButton>
        <UnstyledButton
          onClick={() => {
            const newMinutes = minutes + 1;
            setMinutes(newMinutes);
            date.setHours(hours, newMinutes);
          }}
          disabled={disableMinuteUp}
        >
          <UpArrow />
        </UnstyledButton>
      </TimeButtons>
      <TimeDisplay>
        <StyledTime>
          {hours.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          })}
        </StyledTime>
        <StyledTime>:</StyledTime>
        <StyledTime>
          {minutes.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          })}
        </StyledTime>
      </TimeDisplay>
      <TimeButtons>
        <UnstyledButton
          onClick={() => {
            const newHours = hours - 1;
            setHours(newHours);
            date.setHours(newHours, minutes);
          }}
          disabled={disableHourDown}
        >
          <DownArrow />
        </UnstyledButton>
        <UnstyledButton
          onClick={() => {
            const newMinutes = minutes - 1;
            setMinutes(newMinutes);
            date.setHours(hours, newMinutes);
          }}
          disabled={disableMinuteDown}
        >
          <DownArrow />
        </UnstyledButton>
      </TimeButtons>
    </TimeControl>
  );
};

export default TimeControls;
