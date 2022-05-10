import React from "react";
import styled, { css } from "styled-components";
import { borderBox } from "../../styles/common-style";

export interface IDropdownContainer {
  isOpen: boolean;
  alignRight?: boolean;
  children?: React.ReactNode;
}

const Container = styled.div<Omit<IDropdownContainer, "children">>`
  ${borderBox}
  ${({ theme, isOpen, alignRight }) => css`
    position: absolute;
    ${alignRight ? "right: 0px;" : ""}
    z-index: 100;
    visibility: ${isOpen ? "visible" : "hidden"};
    transform: scaleY(${isOpen ? "1" : "0"});
    transform-origin: top;
    transition-property: transform, visibility;
    transition-duration: ${theme.transitionSpeed};
    transition-timing-function: ease;
    height: auto;
    background: transparent;
    box-shadow: 0px 2px 3px ${theme.defaultShadow};
    overflow: hidden;
  `}
`;

const DropdownContainer: React.FC<IDropdownContainer> = ({
  children,
  isOpen,
  alignRight,
  ...props
}) => <Container {...{ isOpen, alignRight, ...props }}> {children} </Container>;

export default DropdownContainer;
