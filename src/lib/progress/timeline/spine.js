import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.div`
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const Circle = styled.div`
  height: 16px;
  width: 16px;
  flex-basis: auto;
  background-color: ${(props) => props.theme.whiteBackground};
  border-radius: 8px;
  border: 2px solid
    ${(props) => {
      if (props.accepted) return props.theme.success;
      else if (props.refused) return props.theme.error;
      else return props.theme.primaryBlue;
    }};
`;

const Line = styled.div`
  height: auto;
  width: 0px;
  flex-grow: 1;
  border-left: 1px solid ${(props) => props.theme.stroke};
`;

const Spine = ({ accepted, refused, active, line, ...props }) => (
  <Wrapper {...props}>
    <Circle {...{ accepted, refused, active }} />
    {line && <Line />}
  </Wrapper>
);

Spine.propTypes = {
  accepted: PropTypes.bool,
  refused: PropTypes.bool,
  active: PropTypes.bool,
  line: PropTypes.bool,
};

export default Spine;
