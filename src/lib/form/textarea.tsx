import React from "react";
import styled, { ThemedStyledFunction } from "styled-components";
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
    ThemedStyledFunction<"textarea", any, {}, never> {
  message?: string;
}

const Textarea: React.FC<TextareaProps> = ({ message, variant, ...props }) => {
  return (
    <Wrapper>
      <StyledTextarea {...props} />
      {message && <StyledMessage variant={variant}>{message}</StyledMessage>}
    </Wrapper>
  );
};

export default Textarea;
