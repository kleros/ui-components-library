import styled, { keyframes } from "styled-components";
import { borderBox, button, p, svg } from "../../styles/common-style";

const breathing = keyframes`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
`;

export interface BaseButtonProps {
  variant?: "primary" | "secondary" | "tertiary";
  small?: boolean;
  loading?: boolean;
}

const BaseButton = styled.button<BaseButtonProps>`
  ${borderBox}
  ${button}
  position: relative;
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: ${(props) => {
    if (props.small)
      return props.variant === "secondary" ? "5px 23px" : "6px 24px";
    return props.variant === "secondary" ? "10.5px 31px" : "11.5px 32px";
  }};
  border-radius: 3px;
  border: none;

  transition: background ease ${(props) => props.theme.transitionSpeed};

  .button-text {
    ${p}
    ${({ loading }) => loading && "visibility: hidden;"}
    font-weight: 600;
    text-align: center;
  }

  .button-svg {
    ${svg}
    ${({ loading }) => loading && "visibility: hidden;"}
    height: 16px;
    width: 16px;
    margin-right: 8px;
  }

  .button-loading {
    position: absolute;
    height: 22px;
    fill: ${({ theme }) => theme.stroke};
    animation: ${breathing} 2s ease-out infinite normal;
  }
`;

export default BaseButton;
