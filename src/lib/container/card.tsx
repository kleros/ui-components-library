import styled from "styled-components";

interface CardProps {
  round?: boolean;
  hover?: boolean;
}

const Card = styled.div<CardProps>`
  background: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  box-shadow: 0px 2px 3px ${({ theme }) => theme.defaultShadow};
  border-radius: ${({ round }) => (round ? "18px" : "3px")};
  width: 328px;
  height: 200px;

  transition: box-shadow ease ${({ theme }) => theme.transitionSpeed};

  ${({ theme, hover }) =>
    hover &&
    `
  :hover {
    box-shadow: 0px 6px 9px ${theme.hoveredShadow};
  }
  `}
`;

export default Card;
