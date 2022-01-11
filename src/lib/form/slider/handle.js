import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Handle as RCHandle } from "rc-slider";
import "rc-slider/assets/index.css";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  top: 8px;
`;

const Label = styled.small`
  position: relative;
  left: ${(props) => props.offset}%;
  transform: translateX(-50%);
  bottom: 44px;

  color: ${(props) => props.theme.primaryBlue};
`;

const StyledHandle = styled(RCHandle)`
  width: 30px;
  height: 30px;
  margin-top: -19px;
  border: 3px solid ${(props) => props.theme.primaryBlue};
  background-color: ${(props) => props.theme.whiteBackground};

  :hover {
    cursor: pointer;
    border-color: ${(props) => props.theme.primaryBlue};
  }

  :active {
    box-shadow: 0 0 5px ${(props) => props.theme.primaryBlue};
  }
`;

const Handle = ({ label, dragging, ...props }) => {
  return (
    <Wrapper>
      <Label offset={props.offset}>{label}</Label>
      <StyledHandle dragging={dragging.toString()} {...props} />
    </Wrapper>
  );
};

Handle.propTypes = {
  dragging: PropTypes.bool.isRequired,
  label: PropTypes.string,
  offset: PropTypes.number.isRequired,
};

export default Handle;
