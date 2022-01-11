import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";

const Wrapper = styled.div`
  height: 45px;
  width: 278px;
  position: relative;
  color: red;

  svg {
    height: 16px;
    width: 16px;
    position: absolute;
    top: 14px;
    right: 16px;
  }
`;

const StyledSuccessIcon = styled(SuccessIcon)`
  fill: ${(props) => props.theme.success};
`;

const StyledWarningIcon = styled(WarningIcon)`
  fill: ${(props) => props.theme.warning};
`;

const StyledErrorIcon = styled(ErrorIcon)`
  fill: ${(props) => props.theme.error};
`;

const StyledInput = styled.input`
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
  padding: 0px 40px 0px 16px;

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
    else return props.theme.secondaryText;
  }};
`;

const Field = (props) => {
  return (
    <Wrapper>
      <StyledInput {...props} />
      {props.success && <StyledSuccessIcon />}
      {props.warning && <StyledWarningIcon />}
      {props.error && <StyledErrorIcon />}
      {props.message && (
        <StyledMessage {...props}>{props.message}</StyledMessage>
      )}
    </Wrapper>
  );
};

Field.propTypes = {
  success: PropTypes.bool,
  warning: PropTypes.bool,
  error: PropTypes.bool,
  message: PropTypes.string,
};

export default Field;
