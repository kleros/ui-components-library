import React, { TextareaHTMLAttributes } from "react";
import styled from "styled-components";
import { baseInputStyle, StyledMessage, VariantProp } from "./field";
import { borderBox } from "../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  height: 115px;
  width: 400px;
  position: relative;
`;

const StyledTextarea = styled.textarea`
  resize: none;
  padding: 16px;
  ${baseInputStyle}
`;

type TextareaProps = VariantProp &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { message?: string };

const Textarea: React.FC<TextareaProps> = ({ message, variant, ...props }) => (
  <Wrapper>
    <StyledTextarea {...{ variant, ...props }} />
    {message && <StyledMessage {...{ variant }}>{message}</StyledMessage>}
  </Wrapper>
);

Textarea.displayName = "Textarea";

export default Textarea;
