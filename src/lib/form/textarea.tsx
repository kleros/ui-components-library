import React, { TextareaHTMLAttributes } from "react";
import styled from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";

import { baseInputStyle, variantColor, VariantProp } from "./field";
import { borderBox, small, svg } from "../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  height: 115px;
  width: 400px;
  position: relative;
`;

const StyledTextarea = styled.textarea`
  resize: none;
  padding: 16px;
  display: block;
  ${baseInputStyle}
`;

const StyledSVG = styled.svg``;

const Message = styled.div<VariantProp>`
  margin-top: 6px;
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

const StyledSmall = styled.small`
  ${small}
  position: relative;
  text-align: justify;
  color: ${variantColor};
`;

type TextareaProps = VariantProp &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { message?: string };

const Textarea: React.FC<TextareaProps> = ({
  message,
  variant,
  className,
  ...props
}) => (
  <Wrapper {...{ className }}>
    <StyledTextarea {...{ variant, ...props }} />
    {message && (
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
        <StyledSmall {...{ variant }}>{message}</StyledSmall>
      </Message>
    )}
  </Wrapper>
);

Textarea.displayName = "Textarea";

export default Textarea;
