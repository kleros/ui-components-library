import React from "react";
import styled, { css } from "styled-components";
import Dot from "../dot";
import {
  borderBox,
  svg,
  p,
  hoverShortTransitionTiming,
} from "../../styles/common-style";

interface IItem {
  selected?: boolean;
  current?: boolean;
}

const Item = styled.div<IItem>`
  ${borderBox}
  ${hoverShortTransitionTiming}
  background-color: ${({ selected, theme }) =>
    selected ? theme.klerosUIComponentsMediumBlue : ""};
  padding: ${({ current }) =>
    current ? "10.5px 16px 10.5px 13px" : "11.5px 16px 11.5px 13px"};
  display: flex;
  align-items: center;

  ${(props) =>
    !props.current &&
    css`
      :hover {
        background: ${props.theme.klerosUIComponentsMediumBlue};
        cursor: pointer;
      }
    `}

  .item-icon {
    ${svg}
    max-height: 16px;
    max-width: 16px;
    min-height: 12px;
    min-width: 12px;
  }
`;

const StyledText = styled.p`
  ${p}
  font-size: 16px;
  user-select: none;
`;

const CountDisplay = styled.label`
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
  border-radius: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
`;
export interface IBaseItem
  extends IItem,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  text: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  icon?: React.ReactNode;
  dot?: string;
  childrenCount?: number;
  onClick?: () => void;
}

const BaseItem: React.FC<IBaseItem> = ({
  text,
  Icon,
  icon,
  dot,
  onClick,
  childrenCount,
  ...props
}) => (
  <Item
    onKeyPress={(e) => (onClick && e.key === "Enter" ? onClick() : undefined)}
    {...{ onClick, ...props }}
  >
    {icon ?? (Icon && <Icon className="item-icon" />)}
    {dot && <Dot className="mr-2" color={dot} />}
    <StyledText>{text}</StyledText>
    {childrenCount !== undefined ? (
      <CountDisplay className="count-display">
        <span>{childrenCount}</span>
      </CountDisplay>
    ) : null}
  </Item>
);

export default BaseItem;
