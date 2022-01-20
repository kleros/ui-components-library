import React from "react";
import styled, { css } from "styled-components";

interface TooltipBaseProps {
  place?: "left" | "right" | "top" | "bottom";
  small?: boolean;
}

const StyledTooltip = styled.span<TooltipBaseProps>`
  ${({ place, theme, small }) => css`
    visibility: hidden;
    position: absolute;
    z-index: 1;
    width: max-content;
    max-width: 240px;
    background: ${theme.primaryBlue};
    border-radius: 3px;
    padding: 13px 16px;
    display: flex;
    justify-content: center;
    align-items: center;

    small {
      font-weight: 600;
      text-align: ${small ? "center" : "left"};
      color: ${theme.whiteBackground};
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
        border-color: ${theme.primaryBlue} transparent transparent transparent;
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
        border-color: transparent ${theme.primaryBlue} transparent transparent;
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
        border-color: transparent transparent ${theme.primaryBlue} transparent;
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
        border-color: transparent transparent transparent ${theme.primaryBlue};
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
}

const Tooltip: React.FC<TooltipProps> = ({
  place = "top",
  text,
  children,
  small,
}) => (
  <Wrapper>
    {children}
    <StyledTooltip small={small} place={place}>
      <small>{text}</small>
    </StyledTooltip>
  </Wrapper>
);

export default Tooltip;
