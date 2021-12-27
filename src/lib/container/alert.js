import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";

const Wrapper = styled.div`
  width: 328px;
  height: fit-content;
  background: ${(props) => props.theme.whiteBackground};
  border: 1px solid
    ${(props) => {
      if (props.success) return props.theme.success;
      else if (props.warning) return props.theme.warning;
      else if (props.error) return props.theme.error;
      else return props.theme.primaryBlue;
    }};
  border-radius: 3px;
  padding: 16px 24px;
  display: flex;
  align-items: center;

  svg {
    height: 24px;
    width: 24px;
    fill: ${(props) => {
      if (props.success) return props.theme.success;
      if (props.warning) return props.theme.warning;
      if (props.error) return props.theme.error;
      if (props.info) return props.theme.primaryBlue;
    }};
  }
`;

const Text = styled.div`
  margin-left: 16px;
  h2 {
    color: ${(props) => {
      if (props.success) return props.theme.success;
      if (props.warning) return props.theme.warning;
      if (props.error) return props.theme.error;
      if (props.info) return props.theme.primaryBlue;
    }};
  }
  p {
    font-size: 14px;
  }
`;

const Alert = (props) => {
  const { success, warning, error, info, title, msg } = props;
  return (
    <Wrapper {...props}>
      {success && <SuccessIcon />}
      {warning && <WarningIcon />}
      {error && <ErrorIcon />}
      {info && <InfoIcon />}
      <Text success={success} warning={warning} error={error} info={info}>
        <h2>{title}</h2>
        <p>{msg}</p>
      </Text>
    </Wrapper>
  );
};

Alert.propTypes = {
  title: PropTypes.string.isRequired,
  msg: PropTypes.string.isRequired,
  success: PropTypes.bool,
  warning: PropTypes.bool,
  error: PropTypes.bool,
  info: PropTypes.bool,
};

export default Alert;
