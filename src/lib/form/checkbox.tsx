import React, { InputHTMLAttributes } from "react";
import styled, { css, keyframes } from "styled-components";
import CheckmarkIcon from "../../assets/svgs/form/checkmark.svg";
import { borderBox, svg } from "../../styles/common-style";

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
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  ${({ small }) =>
    small
      ? css`
          font-size: 16px;
          padding-left: 28px;
        `
      : css`
          font-size: 22px;
          padding-left: 35px;
        `}
`;

const HiddenInput = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const CheckmarkContainer = styled.div<CheckboxBaseProps & { $small?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  overflow: hidden;
  ${({ $small }) =>
    $small
      ? css`
          width: 16px;
          height: 16px;
        `
      : css`
          width: 24px;
          height: 24px;
        `}

  ${({ theme, checked }) =>
    checked &&
    css`
      background: ${theme.klerosUIComponentsPrimaryBlue};
      border: none;
      :after {
        display: block;
      }
    `}
`;

const bouncedIn = keyframes`
  0%{
      transform: translateY(100%);
  }
  50%{
    transform: translateY(-5px);
  }
  100%{
    transform: translateY(0);
  }
`;

const StyledCheckmark = styled(CheckmarkIcon)<
  CheckboxBaseProps & { $small?: boolean }
>`
  ${svg}

  position: absolute;
  top: 1px;
  width: 100%;
  height: 100%;

  ${({ theme, checked }) =>
    checked
      ? css`
          fill: ${theme.klerosUIComponentsWhiteBackground};
          background: ${theme.klerosUIComponentsPrimaryBlue};
          animation: ${bouncedIn} 200ms ease-out;
        `
      : css`
          fill: transparent;
        `}

  ${({ $small }) =>
    $small
      ? css`
          padding: 0 3px;
        `
      : css`
          padding: 0 4px;
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
  className,
  ...props
}) => (
  <Wrapper {...{ small, className }}>
    {label}
    <HiddenInput checked={checked} {...props} />
    <CheckmarkContainer $small={small} checked={checked}>
      <StyledCheckmark $small={small} checked={checked} />
    </CheckmarkContainer>
  </Wrapper>
);

export default Checkbox;
