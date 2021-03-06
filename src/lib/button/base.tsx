import styled from "styled-components";
import { borderBox, button, p, svg } from "../../styles/common-style";

export interface BaseButtonProps {
  variant?: "primary" | "secondary" | "tertiary";
  small?: boolean;
}

const BaseButton = styled.button<BaseButtonProps>`
  ${borderBox}
  ${button}
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
    font-weight: 600;
    text-align: center;
  }

  .button-svg {
    ${svg}
    height: 16px;
    width: 16px;
    margin-right: 8px;
  }
`;

export default BaseButton;
