import React from "react";
import styled, { css } from "styled-components";
import { borderBox, small as smallStyle } from "../../styles/common-style";

interface TooltipBaseProps {
  place?: "left" | "right" | "top" | "bottom";
  small?: boolean;
}

const StyledText = styled.small``;

const StyledTooltip = styled.span<TooltipBaseProps>`
  ${borderBox}
  ${({ place, theme, small }) => css`
    visibility: hidden;
    position: absolute;
    z-index: 1;
    width: max-content;
    max-width: 240px;
    background: ${theme.klerosUIComponentsPrimaryBlue};
    border-radius: 3px;
    padding: 13px 16px;
    display: flex;
    justify-content: center;
    align-items: center;

    & ${StyledText} {
      ${smallStyle}
      font-weight: 100;
      text-align: ${small ? "center" : "left"};
      color: ${theme.klerosUIComponentsWhiteBackground};
    }

    ::after {
      content: "";
      position: absolute;
      border-width: 8px;
      border-style: solid;
    }

    ${place === "top" &&
    css`
      bottom: calc(100% + 16px);
      left: 50%;
      transform: translateX(-50%);
      ::after {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-color: ${theme.klerosUIComponentsPrimaryBlue} transparent
          transparent transparent;
      }
    `}
    ${place === "right" &&
    css`
      top: 50%;
      left: calc(100% + 16px);
      transform: translateY(-50%);
      ::after {
        top: 50%;
        right: 100%;
        transform: translateY(-50%);
        border-color: transparent ${theme.klerosUIComponentsPrimaryBlue}
          transparent transparent;
      }
    `}
    ${place === "bottom" &&
    css`
      top: calc(100% + 16px);
      left: 50%;
      transform: translateX(-50%);
      ::after {
        left: 50%;
        bottom: 100%;
        transform: translateX(-50%);
        border-color: transparent transparent
          ${theme.klerosUIComponentsPrimaryBlue} transparent;
      }
    `}
    ${place === "left" &&
    css`
      top: 50%;
      right: calc(100% + 16px);
      transform: translateY(-50%);
      ::after {
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        border-color: transparent transparent transparent
          ${theme.klerosUIComponentsPrimaryBlue};
      }
    `}
  `}
`;

const Wrapper = styled.div`
  position: relative;
  display: inline-block;

  &:hover ${StyledTooltip} {
    visibility: visible;
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
    <StyledTooltip {...{ small, place }}>
      <StyledText>{text}</StyledText>
    </StyledTooltip>
  </Wrapper>
);

export default Tooltip;
