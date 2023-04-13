import React from "react";
import styled, { css } from "styled-components";
import BaseItemContainer from "../base-item-container";
import BaseItem, { IBaseItem } from "../base-item";

export const StyledItem = styled(BaseItem)`
  border-left: 3px solid
    ${({ theme, selected }) =>
      selected
        ? theme.klerosUIComponentsPrimaryBlue
        : theme.klerosUIComponentsWhiteBackground};

  ${({ theme, selected, current }) =>
    !current &&
    css`
      :hover {
        border-left: 3px solid
          ${selected
            ? theme.klerosUIComponentsPrimaryBlue
            : theme.klerosUIComponentsMediumBlue};
      }
    `}
`;

export interface IItem extends IBaseItem {
  value: number | string;
}

interface IItemContainer {
  items: IItem[];
  onChange: (value: IItem["value"]) => void;
  selected?: IItem["value"];
}

const ItemContainer: React.FC<IItemContainer> = ({
  items,
  selected,
  onChange,
}) => (
  <BaseItemContainer>
    {items.map(({ text, Icon, dot, value }, i) => (
      <StyledItem
        key={i}
        tabIndex={0}
        selected={value === selected}
        onClick={() => onChange(value)}
        {...{ text, dot, Icon }}
      />
    ))}
  </BaseItemContainer>
);

export default ItemContainer;
