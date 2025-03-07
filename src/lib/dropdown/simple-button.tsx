import React from "react";
import styled, { css } from "styled-components";
import Arrow from "../../assets/svgs/dropdown/arrow.svg";
import {
  borderBox,
  button,
  svg,
  small,
  h1,
  hoverShortTransitionTiming,
} from "../../styles/common-style";

const Container = styled.button`
  ${borderBox}
  ${button}
  background: none;
  display: flex;
  align-items: center;
  padding: 0px;

  :hover {
    small {
      color: ${({ theme }) => theme.klerosUIComponentsSecondaryBlue};
    }
    h1 {
      color: ${({ theme }) => theme.klerosUIComponentsSecondaryBlue};
    }
    svg {
      fill: ${({ theme }) => theme.klerosUIComponentsSecondaryBlue};
    }
  }
`;

const StyledSmallText = styled.small`
  ${small}
  ${hoverShortTransitionTiming}
  font-weight: 600;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
`;

const StyledBigText = styled.h1`
  ${h1}
  ${hoverShortTransitionTiming}
  font-weight: 600;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
`;

const StyledArrow = styled(({ ignoredIsOpen, ignoredSmall, ...props }) => (
  <Arrow {...props} />
))`
  ${svg}
  ${hoverShortTransitionTiming}
  width: ${({ ignoredSmall: small }) => (small ? "8" : "16")}px;
  height: ${({ ignoredSmall: small }) => (small ? "8" : "16")}px;
  fill: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
  ${({ ignoredIsOpen: isOpen }) =>
    isOpen &&
    css`
      transform: rotate(180deg);
    `}
  transition: transform ease
    ${({ theme }) => theme.klerosUIComponentsTransitionSpeed};
  margin-left: 8px;
`;

interface DropdownButtonProps {
  text: string;
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  setIsOpen: Function;
  small?: boolean;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  text,
  isOpen,
  setIsOpen,
  small,
  ...props
}) => (
  <Container onClick={() => setIsOpen(!isOpen)} {...props}>
    {small ? (
      <StyledSmallText>{text}</StyledSmallText>
    ) : (
      <StyledBigText>{text}</StyledBigText>
    )}
    <StyledArrow
      {...{ ignoredIsOpen: isOpen, ignoredSmall: small, ...props }}
    />
  </Container>
);

export default DropdownButton;
