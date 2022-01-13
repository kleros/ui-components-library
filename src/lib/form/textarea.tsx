import React, { TextareaHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";
import { baseInputStyle, StyledMessage, VariantProp } from "./field";

const Wrapper = styled.div`
  height: 115px;
  width: 400px;
  position: relative;
`;

const StyledTextarea = styled.textarea`
  resize: none;
  padding: 16px;
  ${baseInputStyle}
`;

interface TextareaProps
  extends VariantProp,
    TextareaHTMLAttributes<HTMLTextAreaElement> {
  message?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ message, variant, ...props }) => (
    <Wrapper>
      <StyledTextarea {...props} />
      {message && <StyledMessage variant={variant}>{message}</StyledMessage>}
    </Wrapper>
  )
);

export default Textarea;
