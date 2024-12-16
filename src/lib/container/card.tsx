import styled from "styled-components";
import {
  borderBox,
  hoverShortTransitionTiming,
} from "../../styles/common-style";

interface CardProps {
  round?: boolean;
  hover?: boolean;
}

const Card = styled.div<CardProps>`
  ${borderBox}
  ${hoverShortTransitionTiming}
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  box-shadow: 0px 2px 3px
    ${({ theme }) => theme.klerosUIComponentsDefaultShadow};
  border-radius: ${({ round }) => (round ? "18px" : "3px")};
  width: 328px;
  height: 200px;

  ${({ theme, hover }) =>
    hover &&
    `
      :hover {
        background-color: ${theme.klerosUIComponentsLightGrey}BB;
        cursor: pointer;
      }
  `}
`;

export default Card;
