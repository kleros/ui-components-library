import React, { ReactNode } from "react";
import styled, { css } from "styled-components";
import Arrow from "../../assets/svgs/dropdown/arrow.svg";

const Container = styled.button`
  width: 240px;
  background: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px 0px 0px;
`;

const StyledArrow = styled(({ ignoredIsOpen, ...props }) => (
  <Arrow {...props} />
))`
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.stroke};
  ${({ ignoredIsOpen }) =>
    ignoredIsOpen &&
    css`
      transform: rotate(180deg);
    `}
  transition: transform ease ${({ theme }) => theme.transitionSpeed};
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
