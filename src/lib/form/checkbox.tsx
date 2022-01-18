import React, { InputHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import CheckmarkIcon from "../../assets/svgs/form/checkmark.svg";

interface CheckboxBaseProps {
  checked?: boolean;
}

const Wrapper = styled.label`
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  user-select: none;
`;

const HiddenInput = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const StyledCheckmark = styled(CheckmarkIcon)<
  CheckboxBaseProps & { $small?: boolean }
>`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.stroke};
  ${({ $small }) =>
    $small
      ? css`
          padding: 0 3px;
          width: 16px;
          height: 16px;
        `
      : css`
          padding: 0 4px;
          width: 24px;
          height: 24px;
        `}

  ${({ theme, checked }) =>
    checked &&
    css`
      background: ${theme.primaryBlue};
      border: none;

      :after {
        display: block;
      }
    `}
`;

interface CheckboxProps
  extends CheckboxBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  small?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  small = false,
  checked,
  label,
  ...props
}) => (
  <Wrapper>
    {label}
    <HiddenInput checked={checked} {...props} />
    <StyledCheckmark $small={small} checked={checked} />
  </Wrapper>
);

export default Checkbox;
