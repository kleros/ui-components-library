import React from "react";
import styled from "styled-components";
import { Handle as RCHandle, HandleProps as RCHandleProps } from "rc-slider";
import "rc-slider/assets/index.css";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  top: 8px;
`;

interface LabelProps {
  offset?: number;
}

const Label = styled.small<LabelProps>`
  position: relative;
  left: ${({ offset }) => offset}%;
  transform: translateX(-50%);
  bottom: 44px;

  color: ${({ theme }) => theme.primaryBlue};
`;

const StyledHandle = styled(RCHandle)<{ dragging: string }>`
  width: 30px;
  height: 30px;
  margin-top: -19px;
  border: 3px solid ${({ theme }) => theme.primaryBlue};
  background-color: ${({ theme }) => theme.whiteBackground};

  :hover {
    cursor: pointer;
    border-color: ${({ theme }) => theme.primaryBlue};
  }

  :active {
    box-shadow: 0 0 5px ${({ theme }) => theme.primaryBlue};
  }
`;

interface HandleProps extends LabelProps, RCHandleProps {
  dragging?: boolean;
  label?: string;
}

const Handle: React.FC<HandleProps> = ({ label, dragging, ...props }) => (
  <Wrapper>
    <Label offset={props.offset}>{label}</Label>
    <StyledHandle dragging={dragging!.toString()} {...props} />
  </Wrapper>
);

export default Handle;
