import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import UploadIcon from "../../assets/svgs/form/upload-icon.svg";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";

const Wrapper = styled.div`
  width: 200px;
`;

const DropZone = styled.button`
  height: 64px;
  width: 100%;
  background: ${(props) => props.theme.mediumBlue};
  border: 1px dashed ${(props) => props.theme.primaryBlue};
  border-radius: 3px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 14px;
  color: ${(props) => props.theme.primaryBlue};

  svg {
  }
`;

const StyledUploadIcon = styled(UploadIcon)`
  height: 24px;
  width: 24px;
  fill: ${(props) => props.theme.primaryBlue};
`;

const FileInput = styled.input`
  display: none;
`;

const Message = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: flex-start;

  p {
    position: relative;
    top: -1px;
    text-align: justify;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    font-size: 14px;
    line-height: 19px;
    color: ${(props) => {
      if (props.success) return props.theme.success;
      else if (props.warning) return props.theme.warning;
      else if (props.error) return props.theme.error;
      else return props.theme.secondaryText;
    }};
  }

  svg {
    min-width: 16px;
    max-width: 16px;
    margin-right: 8px;
    fill: ${(props) => {
      if (props.success) return props.theme.success;
      else if (props.warning) return props.theme.warning;
      else if (props.error) return props.theme.error;
      else return props.theme.primaryBlue;
    }};
  }
`;

const FileUploader = ({
  callback,
  msg,
  success,
  warning,
  error,
  info,
  ...props
}) => {
  const fileInputRef = useRef();
  const [fileSelected, setFileSelected] = useState();

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    fileInputRef.current.files = event.dataTransfer?.files;
    setFileSelected(event.dataTransfer?.files[0]);
    callback(event.dataTransfer?.files[0]);
  };

  return (
    <Wrapper>
      <DropZone
        onClick={() => fileInputRef?.current.click()}
        onDrop={(e) => handleDrop(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragEnter={(e) => handleDragEnter(e)}
        onDragLeave={(e) => handleDragLeave(e)}
      >
        {fileSelected ? fileSelected.name : <StyledUploadIcon />}
      </DropZone>
      <FileInput
        ref={fileInputRef}
        type="file"
        onChange={(event) => {
          setFileSelected(event.target.files[0]);
          callback(event.target.files[0]);
        }}
        {...props}
      />
      <Message success={success} warning={warning} error={error}>
        {success && <SuccessIcon />}
        {warning && <WarningIcon />}
        {error && <ErrorIcon />}
        {info && <InfoIcon />}
        <p>{msg}</p>
      </Message>
    </Wrapper>
  );
};

FileUploader.propTypes = {
  callback: PropTypes.func.isRequired,
  msg: PropTypes.string,
  success: PropTypes.bool,
  warning: PropTypes.bool,
  error: PropTypes.bool,
  info: PropTypes.bool,
};

export default FileUploader;
