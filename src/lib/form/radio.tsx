import React, { InputHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import { borderBox } from "../../styles/common-style";

interface RadioBaseProps {
  small?: boolean;
  checked?: boolean;
}

const Wrapper = styled.label<RadioBaseProps>`
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

const HiddenInput = styled.input.attrs({ type: "radio" })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
`;

const StyledRadio = styled.span<RadioBaseProps>`
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 50%;
  ${({ small }) =>
    small
      ? css`
          width: 16px;
          height: 16px;
        `
      : css`
          width: 24px;
          height: 24px;
        `}

  :after {
    content: "";
    position: absolute;
    display: none;
    border-radius: 50%;
    background: ${({ theme }) => theme.primaryBlue};
    ${({ small }) =>
      small
        ? css`
            top: 3px;
            left: 3px;
            width: 8px;
            height: 8px;
          `
        : css`
            top: 5px;
            left: 5px;
            width: 12px;
            height: 12px;
          `}
  }

  ${({ theme, checked }) =>
    checked &&
    css`
      background: ${theme.whiteBackground};
      border: 1px solid ${theme.primaryBlue};

      :after {
        display: block;
      }
    `}
`;

interface RadioProps
  extends RadioBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

const Radio: React.FC<RadioProps> = ({ small, checked, label, ...props }) => (
  <Wrapper small={small}>
    {label}
    <HiddenInput checked={checked} {...props} />
    <StyledRadio small={small} checked={checked} />
  </Wrapper>
);

export default Radio;
