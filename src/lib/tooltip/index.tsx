import React from "react";
import styled, { css } from "styled-components";
import { borderBox, small as smallStyle } from "../../styles/common-style";

export interface TooltipBaseProps {
  place?: "left" | "right" | "top" | "bottom";
  small?: boolean;
}

const StyledText = styled.small``;

const Tip = styled.div<TooltipBaseProps>`
  content: "";
  position: absolute;
  border-width: 8px;
  border-style: solid;

  ::after {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 7px;
  }

  ${({ place, theme }) => css`
    ${place === "top" &&
    css`
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-color: ${theme.klerosUIComponentsStroke} transparent transparent
        transparent;

      ::after {
        left: -7px;
        top: -8.5px;
        border-color: ${theme.klerosUIComponentsLightBlue} transparent
          transparent transparent;
      }
    `}
    ${place === "right" &&
    css`
      top: 50%;
      right: 100%;
      transform: translateY(-50%);
      border-color: transparent ${theme.klerosUIComponentsStroke} transparent
        transparent;

      ::after {
        left: -5.5px;
        top: -7px;
        border-color: transparent ${theme.klerosUIComponentsLightBlue}
          transparent transparent;
      }
    `}
    ${place === "bottom" &&
    css`
      left: 50%;
      bottom: 100%;
      transform: translateX(-50%);
      border-color: transparent transparent ${theme.klerosUIComponentsStroke}
        transparent;

      ::after {
        left: -7px;
        top: -5.5px;
        border-color: transparent transparent
          ${theme.klerosUIComponentsLightBlue} transparent;
      }
    `}
    ${place === "left" &&
    css`
      top: 50%;
      left: 100%;
      transform: translateY(-50%);
      border-color: transparent transparent transparent
        ${theme.klerosUIComponentsStroke};
      ::after {
        left: -8.5px;
        top: -7px;
        border-color: transparent transparent transparent
          ${theme.klerosUIComponentsLightBlue};
      }
    `}
  `}
`;

const StyledTooltip = styled.span<TooltipBaseProps>`
  ${borderBox}
  transition: opacity 200ms ease-in, visibility 200ms ease-in;
  ${({ place, theme, small }) => css`
    visibility: hidden;
    opacity: 0%;
    position: absolute;
    z-index: 1;
    width: max-content;
    max-width: 240px;
    background: ${theme.klerosUIComponentsLightBlue};
    border: 1px solid ${theme.klerosUIComponentsStroke};
    border-radius: 7px;
    padding: 13px 16px;
    display: flex;
    justify-content: center;
    align-items: center;

    & ${StyledText} {
      ${smallStyle}
      font-weight: 100;
      text-align: ${small ? "center" : "left"};
      color: ${theme.klerosUIComponentsPrimaryText};
    }

    ${place === "top" &&
    css`
      bottom: calc(100% + 16px);
      left: 50%;
      transform: translateX(-50%);
    `}
    ${place === "right" &&
    css`
      top: 50%;
      left: calc(100% + 16px);
      transform: translateY(-50%);
    `}
    ${place === "bottom" &&
    css`
      top: calc(100% + 16px);
      left: 50%;
      transform: translateX(-50%);
    `}
    ${place === "left" &&
    css`
      top: 50%;
      right: calc(100% + 16px);
      transform: translateY(-50%);
    `}
  `}
`;

const Wrapper = styled.div`
  position: relative;
  display: inline-block;

  &:hover ${StyledTooltip} {
    visibility: visible;
    opacity: 100%;
  }
`;

interface TooltipProps extends TooltipBaseProps {
  text: string;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  place = "top",
  text,
  children,
  small,
  ...props
}) => (
  <Wrapper {...props}>
    {children}
    <StyledTooltip {...{ small, place }} className="tooltip-container">
      <Tip {...{ place }} />
      <StyledText className="tooltip-text">{text}</StyledText>
    </StyledTooltip>
  </Wrapper>
);

export default Tooltip;
