import React, { ReactNode } from "react";
import styled, { css } from "styled-components";
import Dot from "../dot";

interface IItem {
  selected?: boolean;
  current?: boolean;
}

const Item = styled.div<IItem>`
  background: ${({ selected, theme }) =>
    selected ? theme.mediumBlue : theme.whiteBackground};
  padding: ${({ current }) =>
    current ? "10.5px 16px 10.5px 13px" : "11.5px 16px 11.5px 13px"};
  display: flex;
  align-items: center;

  ${(props) =>
    !props.current &&
    css`
      :hover {
        background: ${props.theme.mediumBlue};
        cursor: pointer;
      }
    `}

  p {
    font-size: 16px;
    user-select: none;
  }

  svg {
    max-height: 16px;
    max-width: 16px;
    min-height: 12px;
    min-width: 12px;
  }
`;

const StyledDot = styled(Dot)`
  margin-right: 8px;
`;

export interface IBaseItem
  extends IItem,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  text: string;
  icon?: ReactNode;
  dot?: string;
  onClick?: () => void;
}

const BaseItem: React.FC<IBaseItem> = ({
  text,
  icon,
  dot,
  onClick,
  ...props
}) => (
  <Item
    onKeyPress={(e) => (onClick && e.key === "Enter" ? onClick() : undefined)}
    {...{ onClick, ...props }}
  >
    {icon}
    {dot && <StyledDot color={dot} />}
    <p>{text}</p>
  </Item>
);

export default BaseItem;
