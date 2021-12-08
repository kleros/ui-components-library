import PropTypes from "prop-types";
import styled from "styled-components";

const Card = styled.div`
  background: ${(props) => props.theme.background};
  border: 1px solid ${(props) => props.theme.stroke};
  box-sizing: border-box;
  box-shadow: 0px 2px 3px ${(props) => props.theme.stroke}80;
  border-radius: ${(props) => (props.round ? "18px" : "3px")};
  width: 328px;
  height: 200px;

  transition: box-shadow 0.5s;

  ${(props) => {
    if (props.hover)
      return `
        :hover {
          box-shadow: 0px 6px 9px ${props.theme.stroke}80;
        }
      `;
  }}
`;

Card.propTypes = {
  round: PropTypes.bool,
};

export default Card;
