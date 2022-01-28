import React from "react";
import styled, { css } from "styled-components";
import Arrow from "../../assets/svgs/dropdown/arrow.svg";
import { borderBox, button, svg, small, h1 } from "../../styles/common-style";

const Container = styled.button`
  ${borderBox}
  ${button}
  background: ${({ theme }) => theme.whiteBackground};
  display: flex;
  align-items: center;
  padding: 0px;
`;

const StyledSmallText = styled.small`
  ${small}
  font-weight: 600;
  color: ${({ theme }) => theme.primaryBlue};
`;

const StyledBigText = styled.h1`
  ${h1}
  font-weight: 600;
  color: ${({ theme }) => theme.primaryBlue};
`;

const StyledArrow = styled(({ ignoredIsOpen, ignoredSmall, ...props }) => (
  <Arrow {...props} />
))`
  ${svg}
  width: ${({ ignoredSmall: small }) => (small ? "8" : "16")}px;
  height: ${({ ignoredSmall: small }) => (small ? "8" : "16")}px;
  fill: ${({ theme }) => theme.primaryBlue};
  ${({ ignoredIsOpen: isOpen }) =>
    isOpen &&
    css`
      transform: rotate(180deg);
    `}
  transition: transform ease ${({ theme }) => theme.transitionSpeed};
  margin-left: 8px;
`;

interface DropdownButtonProps {
  text: string;
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
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
