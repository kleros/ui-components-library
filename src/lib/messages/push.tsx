import React from "react";
import styled from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/solid-success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/solid-error.svg";
import SyncIcon from "../../assets/svgs/status-icons/sync.svg";
import CloseIcon from "../../assets/svgs/status-icons/close.svg";

type SmallProp = { small?: boolean };
type VariantProp = { variant?: "success" | "error" | "sync" };

const Wrapper = styled.div<SmallProp>`
  position: relative;
  height: ${({ small }) => (small ? "48px" : "100px")};
  width: ${({ small }) => (small ? "300px" : "422px")};
  background: ${({ theme }) => theme.primaryBlue};
  border-radius: 3px;
  padding: ${({ small }) =>
    small ? "12px 24px 12px 24px" : "16px 32px 16px 24px"};
  display: flex;
  align-items: center;

  svg {
    height: ${({ small }) => (small ? "24px" : "32px")};
    width: ${({ small }) => (small ? "24px" : "32px")};
    min-height: ${({ small }) => (small ? "24px" : "32px")};
    min-width: ${({ small }) => (small ? "24px" : "32px")};
    fill: ${({ theme }) => theme.whiteBackground};
  }
`;

const Text = styled.div`
  margin-left: 16px;
  color: ${({ theme }) => theme.whiteBackground};

  h2 {
    color: inherit;
  }
  small {
    color: inherit;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  height: 8px;
  width: 8px;
  background: none;
  padding: 0;
  display: inline-flex;

  svg {
    position: absolute;
    height: 8px;
    width: 8px;
    min-height: 8px;
    min-width: 8px;
  }
`;

interface PushProps extends SmallProp, VariantProp {
  title: string;
  msg?: string;
  callback: Function;
}

const Push: React.FC<PushProps> = ({
  variant,
  title,
  msg,
  callback,
  small,
  ...props
}) => (
  <Wrapper small={small} {...props}>
    {variant === "success" && <SuccessIcon />}
    {variant === "error" && <ErrorIcon />}
    {variant === "sync" && <SyncIcon />}
    <Text>
      <h2>{title}</h2>
      {!small && <small>{msg}</small>}
    </Text>
    {!small && (
      <CloseButton onClick={() => callback()}>
        <CloseIcon />
      </CloseButton>
    )}
  </Wrapper>
);

export default Push;
