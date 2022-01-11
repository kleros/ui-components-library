import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/solid-success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/solid-error.svg";
import SyncIcon from "../../assets/svgs/status-icons/sync.svg";
import CloseIcon from "../../assets/svgs/status-icons/close.svg";

const Wrapper = styled.div`
  position: relative;
  height: ${(props) => (props.small ? "48px" : "100px")};
  width: ${(props) => (props.small ? "300px" : "422px")};
  background: ${(props) => props.theme.primaryBlue};
  border-radius: 3px;
  padding: ${(props) =>
    props.small ? "12px 24px 12px 24px" : "16px 32px 16px 24px"};
  display: flex;
  align-items: center;

  svg {
    height: ${(props) => (props.small ? "24px" : "32px")};
    width: ${(props) => (props.small ? "24px" : "32px")};
    min-height: ${(props) => (props.small ? "24px" : "32px")};
    min-width: ${(props) => (props.small ? "24px" : "32px")};
    fill: ${(props) => props.theme.whiteBackground};
  }
`;

const Text = styled.div`
  margin-left: 16px;
  color: ${(props) => props.theme.whiteBackground};

  h2 {
    color: inherit;
  }
  small {
    color: inherit;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  height: 8px;
  width: 8px;
  background: none;
  padding: 0;
  display: inline-flex;

  svg {
    position: absolute;
    height: 8px;
    width: 8px;
    min-height: 8px;
    min-width: 8px;
  }
`;

const Push = (props) => {
  const { success, error, sync, title, msg, callback, small, ...rest } = props;
  return (
    <Wrapper small={small} {...rest}>
      {success && <SuccessIcon />}
      {error && <ErrorIcon />}
      {sync && <SyncIcon />}
      <Text>
        <h2>{title}</h2>
        {!small && <small>{msg}</small>}
      </Text>
      {!small && (
        <CloseButton onClick={() => callback()}>
          <CloseIcon />
        </CloseButton>
      )}
    </Wrapper>
  );
};

Push.propTypes = {
  title: PropTypes.string.isRequired,
  msg: PropTypes.string.isRequired,
  callback: PropTypes.func,
  success: PropTypes.bool,
  error: PropTypes.bool,
  sync: PropTypes.bool,
  small: PropTypes.bool,
};

export default Push;
