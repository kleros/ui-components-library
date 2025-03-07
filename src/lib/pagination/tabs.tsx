import React from "react";
import styled from "styled-components";
import {
  borderBox,
  button,
  hoverShortTransitionTiming,
  hoverLongTransitionTiming,
  svg,
} from "../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  height: fit-content;
  width: 500px;
  display: flex;
`;

const StyledSVG = styled.svg``;

const StyledTab = styled.button<{ selected?: boolean }>`
  ${button}
  ${hoverShortTransitionTiming}
  flex-grow: 1;
  height: 45px;
  background: none;
  border-bottom: 3px solid
    ${(props) =>
      props.selected
        ? props.theme.klerosUIComponentsPrimaryBlue
        : props.theme.klerosUIComponentsStroke};
  display: flex;
  align-items: center;
  justify-content: center;

  color: ${(props) => {
    if (props.selected) return props.theme.klerosUIComponentsPrimaryBlue;
    else if (props.disabled) return props.theme.klerosUIComponentsStroke;
    else return props.theme.klerosUIComponentsPrimaryText;
  }};

  ${(props) =>
    !props.disabled && !props.selected
      ? `:hover {
        ${hoverLongTransitionTiming}
            border-bottom: 3px solid
              ${props.theme.klerosUIComponentsSecondaryBlue};
          }`
      : ""}

  & ${StyledSVG} {
    ${svg}
    ${hoverShortTransitionTiming}
    height: 16px;
    width: 16px;
    margin-right: 16px;

    fill: ${(props) => {
      if (props.selected) return props.theme.klerosUIComponentsPrimaryBlue;
      else if (props.disabled) return props.theme.klerosUIComponentsStroke;
      else return props.theme.klerosUIComponentsPrimaryText;
    }};
  }
`;

interface TabsItem {
  text: string;
  value: any;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  currentValue: any;
  items: TabsItem[];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function;
}

const Tabs: React.FC<TabsProps> = ({ items, ...props }) => {
  return (
    <Wrapper {...props}>
      {items.map(({ Icon, icon, text, value, disabled }) => (
        <StyledTab
          disabled={disabled}
          selected={value === props.currentValue}
          key={value}
          onClick={() => props.callback(value)}
        >
          {icon ?? (Icon && <Icon className={StyledSVG.styledComponentId} />)}
          {text}
        </StyledTab>
      ))}
    </Wrapper>
  );
};

export default Tabs;
