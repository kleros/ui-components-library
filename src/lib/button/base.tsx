import styled from "styled-components";

export interface BaseButtonProps {
  variation?: "primary" | "secondary" | "tertiary";
  small?: boolean;
}

const BaseButton = styled.button<BaseButtonProps>`
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: ${(props) => {
    if (props.small)
      return props.variation === "secondary" ? "5px 23px" : "6px 24px";
    return props.variation === "secondary" ? "10.5px 31px" : "11.5px 32px";
  }};
  border-radius: 3px;
  border: none;

  transition: background ease ${(props) => props.theme.transitionSpeed};

  p {
    font-weight: 600;
    text-align: center;
  }

  svg {
    height: 16px;
    width: 16px;
    margin-right: 8px;
  }
`;

export default BaseButton;
