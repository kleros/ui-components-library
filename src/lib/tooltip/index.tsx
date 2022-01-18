import React from "react";
import styled, { css } from "styled-components";

interface TooltipBaseProps {
  place?: "left" | "right" | "top" | "bottom";
  small?: boolean;
}

const StyledTooltip = styled.span<TooltipBaseProps>`
  ${({ place, theme, small }) => css`
    visibility: hidden;
    background: ${theme.primaryBlue};
    color: ${theme.whiteBackground};
    border-radius: 3px;
    padding: 15px 16px;
    position: absolute;
    z-index: 1;
    font-weight: 600;
    font-size: 14px;
    text-align: ${small ? "center" : "left"};
    ${small
      ? css`
          height: 45px;
          white-space: nowrap;
        `
      : css`
          max-height: 84px;
          width: 214px;
        `}

    ::after {
      content: "";
      position: absolute;
      border-width: 5px;
      border-style: solid;
    }

    ${place === "top" &&
    css`
      bottom: calc(100% + 12px);
      left: 50%;
      margin-left: ${small ? "-60px" : "-107px"};
      ::after {
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-color: ${theme.primaryBlue} transparent transparent transparent;
      }
    `}
    ${place === "right" &&
    css`
      top: ${small ? "-15px" : "-27px"};
      left: calc(100% + 12px);
      ::after {
        top: 50%;
        right: 100%;
        margin-top: -5px;
        border-color: transparent ${theme.primaryBlue} transparent transparent;
      }
    `}
    ${place === "bottom" &&
    css`
      top: calc(100% + 12px);
      left: 50%;
      margin-left: ${small ? "-60px" : "-107px"};
      ::after {
        left: 50%;
        bottom: 100%;
        margin-left: -5px;
        border-color: transparent transparent ${theme.primaryBlue} transparent;
      }
    `}
      ${place === "left" &&
    css`
      top: ${small ? "-15px" : "-27px"};
      right: calc(100% + 12px);
      ::after {
        top: 50%;
        left: 100%;
        margin-top: -5px;
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
      {text}
    </StyledTooltip>
  </Wrapper>
);

export default Tooltip;
