import React, { InputHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import { borderBox } from "../../styles/common-style";

interface SwitchBaseProps {
  small?: boolean;
  checked?: boolean;
}

const StyledSwitch = styled.label<SwitchBaseProps>`
  ${borderBox}
  position: relative;
  display: inline-block;
  height: ${({ small }) => (small ? "16px" : "24px")};
  width: ${({ small }) => (small ? "32px" : "48px")};
`;

const HiddenInput = styled.input.attrs({ type: "checkbox" })`
  opacity: 0;
  width: 0;
  height: 0;
`;

const StyledSlider = styled.span<SwitchBaseProps>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.stroke};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: ${({ small }) => (small ? "12px" : "20px")};
    width: ${({ small }) => (small ? "12px" : "20px")};
    left: 2px;
    bottom: 2px;
    border-radius: 50%;
    background-color: white;
    transition: 0.4s;
  }

  ${({ checked, theme, small }) =>
    checked &&
    css`
      background-color: ${theme.primaryBlue};

      :before {
        transform: translateX(${small ? "16px" : "24px"});
      }
    `}
`;

type SwitchProps = SwitchBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const Switch: React.FC<SwitchProps> = ({ small, checked, ...props }) => (
  <StyledSwitch small={small}>
    <HiddenInput checked={checked} {...props} />
    <StyledSlider small={small} checked={checked} />
  </StyledSwitch>
);

export default Switch;
