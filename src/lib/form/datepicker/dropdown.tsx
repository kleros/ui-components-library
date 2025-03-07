import React from "react";
import styled, { css } from "styled-components";
import DateSelector, { IDateSelector } from "./date-selector";
import TimeSelector, { ITimeControls } from "./time-selector";
import Button from "../../button";
import { mobileStyle } from "../../../styles/common-style";

interface IContainer {
  time?: boolean;
  isOpen?: boolean;
}

const Container = styled.div<IContainer>`
  position: absolute;
  z-index: 100;
  overflow: hidden;
  height: ${({ isOpen }) => (isOpen ? "auto" : "0")};
  width: ${({ time }) => (time ? "450px" : "330px")};
  transition: height ease
    ${({ theme }) => theme.klerosUIComponentsTransitionSpeed};
  background: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  ${({ isOpen, theme }) =>
    isOpen ? `border: 1px solid ${theme.klerosUIComponentsStroke}` : ""};
  box-shadow: 0px 2px 3px
    ${({ theme }) => theme.klerosUIComponentsDefaultShadow};
  border-radius: 3px;

  ${mobileStyle(
    () => css`
      width: 332px;
      position: static;
      margin: 0;
      left: 0;
      top: 0;
    `,
  )}
`;

const Selectors = styled.div`
  display: flex;

  ${mobileStyle(
    () => css`
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    `,
  )}
`;

const ButtonContainer = styled.div`
  width: 100%;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  ${mobileStyle(
    () => css`
      justify-content: center;
    `,
  )}
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
