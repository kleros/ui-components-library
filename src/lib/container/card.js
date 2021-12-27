import PropTypes from "prop-types";
import styled from "styled-components";

const Card = styled.div`
  background: ${(props) => props.theme.whiteBackground};
  border: 1px solid ${(props) => props.theme.stroke};
  box-shadow: 0px 2px 3px ${(props) => props.theme.defaultShadow};
  border-radius: ${(props) => (props.round ? "18px" : "3px")};
  width: 328px;
  height: 200px;

  transition: box-shadow ease ${(props) => props.theme.transitionSpeed};

  ${(props) => {
    if (props.hover)
      return `
        :hover {
          box-shadow: 0px 6px 9px ${props.theme.hoveredShadow};
        }
      `;
  }}
`;

Card.propTypes = {
  round: PropTypes.bool,
  hover: PropTypes.bool,
};

export default Card;
