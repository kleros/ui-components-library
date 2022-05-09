import React from "react";
import styled from "styled-components";
import { borderBox, button, svg } from "../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  height: fit-content;
  width: 500px;
  display: flex;
`;

const StyledSVG = styled.svg``;

const StyledTab = styled.button<{ selected?: boolean }>`
  ${button}
  flex-grow: 1;
  height: 45px;
  background: none;
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

  & ${StyledSVG} {
    ${svg}
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
  text: string;
  value: any;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  disabled?: boolean;
}

interface TabsProps {
  currentValue: any;
  items: TabsItem[];
  //eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
}

const Tabs: React.FC<TabsProps> = ({ items, ...props }) => {
  return (
    <Wrapper {...props}>
      {items.map(({ Icon, text, value, disabled }) => (
        <StyledTab
          disabled={disabled}
          selected={value === props.currentValue}
          key={value}
          onClick={() => props.callback(value)}
        >
          {Icon && <Icon className={StyledSVG.styledComponentId} />}
          {text}
        </StyledTab>
      ))}
    </Wrapper>
  );
};

export default Tabs;
