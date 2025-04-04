import React from "react";
import styled from "styled-components";
import SuccessIcon from "../../assets/svgs/status-icons/solid-success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/solid-error.svg";
import SyncIcon from "../../assets/svgs/status-icons/sync.svg";
import CloseIcon from "../../assets/svgs/status-icons/close.svg";
import { borderBox, svg, h2, small, button } from "../../styles/common-style";

type SmallProp = { small?: boolean };
type VariantProp = { variant?: "success" | "error" | "sync" };

const StyledSVG = styled.svg``;

const Wrapper = styled.div<SmallProp>`
  ${borderBox}
  position: relative;
  height: ${({ small }) => (small ? "48px" : "100px")};
  width: ${({ small }) => (small ? "300px" : "422px")};
  background: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
  border-radius: 3px;
  padding: ${({ small }) =>
    small ? "12px 24px 12px 24px" : "16px 32px 16px 24px"};
  display: flex;
  align-items: center;

  & ${StyledSVG} {
    ${svg}
    height: ${({ small }) => (small ? "24px" : "32px")};
    width: ${({ small }) => (small ? "24px" : "32px")};
    min-height: ${({ small }) => (small ? "24px" : "32px")};
    min-width: ${({ small }) => (small ? "24px" : "32px")};
    fill: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  }
`;

const StyledTitle = styled.h2<VariantProp>`
  ${h2}
  color: inherit;
`;

const StyledMessage = styled.small`
  ${small}
  color: inherit;
`;

const Text = styled.div`
  margin-left: 16px;
  color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
`;

const CloseButton = styled.button`
  ${button}
  position: absolute;
  top: 24px;
  right: 24px;
  height: 8px;
  width: 8px;
  background: none;
  padding: 0;
  display: inline-flex;
`;

const StyledCloseIcon = styled(CloseIcon)`
  ${svg}
  height: 8px;
  width: 8px;
  min-height: 8px;
  min-width: 8px;
  fill: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
`;

interface PushProps extends SmallProp, VariantProp {
  title: string;
  msg?: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
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
  <Wrapper {...{ small, ...props }}>
    {variant === "success" && (
      <SuccessIcon className={StyledSVG.styledComponentId} />
    )}
    {variant === "error" && (
      <ErrorIcon className={StyledSVG.styledComponentId} />
    )}
    {variant === "sync" && <SyncIcon className={StyledSVG.styledComponentId} />}
    <Text>
      <StyledTitle>{title}</StyledTitle>
      {!small && <StyledMessage>{msg}</StyledMessage>}
    </Text>
    {!small && (
      <CloseButton onClick={() => callback()}>
        <StyledCloseIcon />
      </CloseButton>
    )}
  </Wrapper>
);

export default Push;
