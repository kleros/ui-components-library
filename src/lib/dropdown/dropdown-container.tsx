import React from "react";
import styled, { css } from "styled-components";
import { borderBox } from "../../styles/common-style";

export interface IDropdownContainer {
  isOpen: boolean;
}

const Container = styled.div<IDropdownContainer>`
  ${borderBox}
  ${({ theme, isOpen }) => css`
    position: absolute;
    z-index: 100;
    transform: ${isOpen ? "scaleY(1)" : "scaleY(0)"};
    transform-origin: top;
    height: auto;
    background: transparent;
    box-shadow: 0px 2px 3px ${theme.defaultShadow};
    overflow: hidden;
  `}
`;

const DropdownContainer: React.FC<IDropdownContainer> = ({
  children,
  isOpen,
  ...props
}) => <Container {...{ isOpen, ...props }}>{isOpen && children}</Container>;

export default DropdownContainer;
