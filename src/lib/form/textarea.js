import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.div`
  height: 115px;
  width: 400px;
  position: relative;
`;
const StyledTextarea = styled.textarea`
  height: 100%;
  width: 100%;
  background: ${(props) => props.theme.whiteBackground};
  border: 1px solid
    ${(props) => {
      if (props.warning) return props.theme.warning;
      else if (props.error) return props.theme.error;
      else if (props.success) return props.theme.success;
      else return props.theme.stroke;
    }};
  border-radius: 3px;
  resize: none;
  padding: 16px;

  color: ${(props) => props.theme.primaryText};

  :focus {
    outline: none;
    border: 1px solid ${(props) => props.theme.primaryBlue}40;
    box-shadow: 0px 0px 6px ${(props) => props.theme.primaryBlue};
    border-radius: 3px;
  }

  ::placeholder {
    color: ${(props) => props.theme.secondaryText};
  }
`;

const StyledMessage = styled.small`
  line-height: 1em;
  margin-top: 5px;
  margin-left: 16px;
  color: ${(props) => {
    if (props.warning) return props.theme.warning;
    else if (props.error) return props.theme.error;
    else if (props.success) return props.theme.success;
    else return props.theme.stroke;
  }};
`;

const Textarea = (props) => {
  return (
    <Wrapper>
      <StyledTextarea {...props} />
      {props.message && (
        <StyledMessage {...props}>{props.message}</StyledMessage>
      )}
    </Wrapper>
  );
};

Textarea.propTypes = {
  success: PropTypes.bool,
  warning: PropTypes.bool,
  error: PropTypes.bool,
  message: PropTypes.string,
};

export default Textarea;
