import React, { ReactNode } from "react";
import styled, { css } from "styled-components";
import Arrow from "../../assets/svgs/dropdown/arrow.svg";
import {
  borderBox,
  button,
  hoverLongTransitionTiming,
  svg,
  hoverMediumBlue,
} from "../../styles/common-style";

const Container = styled.button`
  ${borderBox}
  ${button}
  ${hoverLongTransitionTiming}
  ${hoverMediumBlue}
  width: 240px;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px 0px 0px;
`;

const StyledArrow = styled(({ ignoredIsOpen, ...props }) => (
  <Arrow {...props} />
))`
  ${svg}
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.klerosUIComponentsStroke};
  ${({ ignoredIsOpen }) =>
    ignoredIsOpen &&
    css`
      transform: rotate(180deg);
    `}
  transition: transform ease
    ${({ theme }) => theme.klerosUIComponentsTransitionSpeed};
`;

interface DropdownButtonProps {
  node: ReactNode;
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setIsOpen: Function;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  node,
  isOpen,
  setIsOpen,
  ...props
}) => (
  <Container onClick={() => setIsOpen(!isOpen)} {...props}>
    {node}
    <StyledArrow ignoredIsOpen={isOpen} {...props} />
  </Container>
);

export default DropdownButton;
