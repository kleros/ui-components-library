import React, { useState, useRef } from "react";
import styled from "styled-components";
import UploadIcon from "../../assets/svgs/form/upload-icon.svg";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";
import { variantColor, VariantProp } from "./field";

const Wrapper = styled.div`
  width: 200px;
`;

const DropZone = styled.button`
  height: 64px;
  width: 100%;
  background: ${({ theme }) => theme.mediumBlue};
  border: 1px dashed ${({ theme }) => theme.primaryBlue};
  border-radius: 3px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 14px;
  color: ${({ theme }) => theme.primaryBlue};

  svg {
  }
`;

const StyledUploadIcon = styled(UploadIcon)`
  height: 24px;
  width: 24px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const FileInput = styled.input`
  display: none;
`;

const Message = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: flex-start;

  small {
    position: relative;
    top: -1px;
    text-align: justify;
    color: ${variantColor};
  }

  svg {
    min-width: 16px;
    max-width: 16px;
    margin-right: 8px;
    fill: ${variantColor};
  }
`;

interface FileUploaderProps extends VariantProp {
  callback: Function;
  msg?: string;
  info?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  callback,
  msg,
  variant,
  info,
  ...props
}) => {
  const fileInputRef = useRef<any>(); //! type
  const [fileSelected, setFileSelected] = useState<File>();

  const handleDragEnter = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
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
        type='file'
        onChange={(event) => {
          setFileSelected(event.target.files![0]);
          callback(event.target.files![0]);
        }}
        {...props}
      />
      <Message variant={variant}>
        {variant === "success" && <SuccessIcon />}
        {variant === "warning" && <WarningIcon />}
        {variant === "error" && <ErrorIcon />}
        {info && <InfoIcon />}
        <small>{msg}</small>
      </Message>
    </Wrapper>
  );
};

export default FileUploader;
