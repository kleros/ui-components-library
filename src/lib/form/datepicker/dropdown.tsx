import React from "react";
import styled from "styled-components";
import DateSelector, { IDateSelector } from "./date-selector";
import TimeSelector, { ITimeControls } from "./time-selector";
import Button from "../../button";

interface IContainer {
  time?: boolean;
  isOpen?: boolean;
}
const Container = styled.div<IContainer>`
  position: absolute;
  z-index: 100;
  overflow: hidden;
  height: ${({ isOpen }) => (isOpen ? "350" : "0")}px;
  width: ${({ time }) => (time ? "450px" : "330px")};
  transition: height ease ${({ theme }) => theme.transitionSpeed};
  background: ${({ theme }) => theme.whiteBackground};
  ${({ isOpen, theme }) => (isOpen ? `border: 1px solid ${theme.stroke}` : "")};
  box-shadow: 0px 2px 3px ${({ theme }) => theme.defaultShadow};
  border-radius: 3px;
`;

const Selectors = styled.div`
  display: flex;
`;

const ButtonContainer = styled.div`
  width: 100%;
  height: 64px;
  padding: 0px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

interface IDropdown extends IDateSelector, ITimeControls, IContainer {
  onSelect: () => void;
}

const Dropdown: React.FC<IDropdown> = ({
  onSelect,
  isOpen,
  time,
  date,
  hours,
  minutes,
  setHours,
  setMinutes,
  ...dateSelectorProps
}) => (
  <Container {...{ isOpen, time }}>
    <Selectors>
      <DateSelector {...dateSelectorProps} />
      {time && (
        <TimeSelector {...{ date, hours, minutes, setHours, setMinutes }} />
      )}
    </Selectors>
    <ButtonContainer>
      <Button small variant={"primary"} text={"Select"} onClick={onSelect} />
    </ButtonContainer>
  </Container>
);

export default Dropdown;
