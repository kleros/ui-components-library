import React, { InputHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import CheckmarkIcon from "../../assets/svgs/form/checkmark.svg";
import { borderBox } from "../../styles/common-style";

interface CheckboxBaseProps {
  checked?: boolean;
  small?: boolean;
}

const Wrapper = styled.label<CheckboxBaseProps>`
  ${borderBox}
  display: block;
  position: relative;
  cursor: pointer;
  user-select: none;
  color: ${({ theme }) => theme.primaryText};
  ${({ small }) =>
    small
      ? css`
          font-size: 16px;
          padding-left: 28px;
          margin-bottom: 10px;
        `
      : css`
          font-size: 22px;
          padding-left: 35px;
          margin-bottom: 12px;
        `}
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
}

const Checkbox: React.FC<CheckboxProps> = ({
  small = false,
  checked,
  label,
  ...props
}) => (
  <Wrapper small={small}>
    {label}
    <HiddenInput checked={checked} {...props} />
    <StyledCheckmark $small={small} checked={checked} />
  </Wrapper>
);

export default Checkbox;
