import React, { ReactNode } from "react";
import styled, { css } from "styled-components";
import Dot from "../dot";

interface ListItemProps {
  selected?: boolean;
  current?: boolean;
}

const ListItem = styled.div<ListItemProps>`
  background: ${({ selected, theme }) =>
    selected ? theme.mediumBlue : theme.whiteBackground};
  border-left: 3px solid
    ${({ selected, theme }) =>
      selected ? theme.primaryBlue : theme.whiteBackground};
  padding: ${({ current }) =>
    current ? "10.5px 16px 10.5px 13px" : "11.5px 16px 11.5px 13px"};
  display: flex;
  align-items: center;

  ${(props) =>
    !props.current &&
    css`
      :hover {
        background: ${props.theme.mediumBlue};
        border-left: 3px solid
          ${props.selected ? props.theme.primaryBlue : props.theme.mediumBlue};
      }
    `}

  :hover {
    cursor: pointer;
  }

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

interface SelectItemProps extends ListItemProps {
  text: string;
  icon?: ReactNode;
  dot?: string;
  onClick?: () => void;
}

const SelectItem: React.FC<SelectItemProps> = ({
  text,
  icon,
  dot,
  onClick,
  ...props
}) => (
  <ListItem
    onClick={onClick}
    onKeyPress={(e) => (onClick && e.key === "Enter" ? onClick() : undefined)}
    {...props}
  >
    {icon}
    {dot && <StyledDot color={dot} />}
    <p>{text}</p>
  </ListItem>
);

export default SelectItem;
