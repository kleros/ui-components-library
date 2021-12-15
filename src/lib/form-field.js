import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import SuccessCircle from "../assets/svgs/form-field/success.svg";
import WarningCircle from "../assets/svgs/form-field/warning.svg";
import ErrorCircle from "../assets/svgs/form-field/error.svg";

const Wrapper = styled.div`
  height: 45px;
  width: 278px;
  position: relative;

  svg {
    height: 16px;
    width: 16px;
    position: absolute;
    top: 14px;
    right: 16px;
  }
`;

const StyledSuccessCircle = styled(SuccessCircle)`
  fill: ${(props) => props.theme.success};
`;

const StyledWarningCircle = styled(WarningCircle)`
  fill: ${(props) => props.theme.warning};
`;

const StyledErrorCircle = styled(ErrorCircle)`
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
  box-sizing: border-box;
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

const FormField = (props) => {
  return (
    <Wrapper>
      <StyledInput placeholder={"test"} {...props} />
      {props.success && <StyledSuccessCircle />}
      {props.warning && <StyledWarningCircle />}
      {props.error && <StyledErrorCircle />}
    </Wrapper>
  );
};

FormField.propTypes = {
  success: PropTypes.bool,
  warning: PropTypes.bool,
  error: PropTypes.bool,
};

export default FormField;
