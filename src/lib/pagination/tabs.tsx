import React, { ReactNode } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: fit-content;
  width: 500px;
  display: flex;
`;

const StyledTab = styled.button<{ selected?: boolean }>`
  flex-grow: 1;
  height: 45px;
  background: ${(props) => props.theme.lightBackground};
  border-bottom: 3px solid
    ${(props) =>
      props.selected ? props.theme.primaryBlue : props.theme.stroke};
  display: flex;
  align-items: center;
  justify-content: center;

  color: ${(props) => {
    if (props.selected) return props.theme.primaryBlue;
    else if (props.disabled) return props.theme.stroke;
    else return props.theme.primaryText;
  }};

  ${(props) =>
    !props.disabled && !props.selected
      ? `:hover {
            border-bottom: 3px solid ${props.theme.secondaryBlue};
          }`
      : ""}

  svg {
    height: 16px;
    width: 16px;
    margin-right: 16px;

    fill: ${(props) => {
      if (props.selected) return props.theme.primaryBlue;
      else if (props.disabled) return props.theme.stroke;
      else return props.theme.primaryText;
    }};
  }
`;

interface TabsItem {
  icon?: ReactNode;
  text: string;
  value: any;
  disabled?: boolean;
}

interface TabsProps {
  currentValue: any;
  items: TabsItem[];
  callback: Function;
}

const Tabs: React.FC<TabsProps> = ({ items, ...props }) => {
  return (
    <Wrapper {...props}>
      {items.map(({ icon, text, value, disabled }) => (
        <StyledTab
          disabled={disabled}
          selected={value === props.currentValue}
          key={value}
          onClick={() => props.callback(value)}
        >
          {icon}
          {text}
        </StyledTab>
      ))}
    </Wrapper>
  );
};

export default Tabs;
