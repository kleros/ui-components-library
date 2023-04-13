import React, { useState, useRef } from "react";
import styled from "styled-components";
import UploadIcon from "../../assets/svgs/form/upload-icon.svg";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";
import { variantColor } from "./field";
import { borderBox, small, svg, button } from "../../styles/common-style";

type VariantProp = { variant?: "success" | "warning" | "error" | "info" };

const Wrapper = styled.div`
  ${borderBox}
  width: 200px;
`;

const DropZone = styled.button`
  ${button}
  height: 64px;
  width: 100%;
  background: ${({ theme }) => theme.klerosUIComponentsMediumBlue};
  border: 1px dashed ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
  border-radius: 3px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 14px;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
`;

const StyledUploadIcon = styled(UploadIcon)`
  ${svg}
  height: 24px;
  width: 24px;
  fill: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
`;

const FileInput = styled.input`
  display: none;
`;

const StyledSmall = styled.small`
  ${small}
  position: relative;
  top: -1px;
  text-align: justify;
  color: ${variantColor};
`;

const StyledSVG = styled.svg``;

const Message = styled.div<VariantProp>`
  margin-top: 16px;
  display: flex;
  align-items: flex-start;

  & ${StyledSVG} {
    ${svg}
    min-width: 16px;
    max-width: 16px;
    margin-right: 8px;
    fill: ${variantColor};
  }
`;

interface FileUploaderProps extends VariantProp {
  //eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
  msg?: string;
  info?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  callback,
  msg,
  variant,
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
        type="file"
        onChange={(event) => {
          //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          setFileSelected(event.target.files![0]);
          //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          callback(event.target.files![0]);
        }}
        {...props}
      />
      <Message {...{ variant }}>
        {variant === "success" && (
          <SuccessIcon className={StyledSVG.styledComponentId} />
        )}
        {variant === "warning" && (
          <WarningIcon className={StyledSVG.styledComponentId} />
        )}
        {variant === "error" && (
          <ErrorIcon className={StyledSVG.styledComponentId} />
        )}
        {variant === "info" && (
          <InfoIcon className={StyledSVG.styledComponentId} />
        )}
        <StyledSmall {...{ variant }}>{msg}</StyledSmall>
      </Message>
    </Wrapper>
  );
};

export default FileUploader;
