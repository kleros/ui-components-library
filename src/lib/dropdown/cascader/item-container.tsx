import React from "react";
import styled from "styled-components";
import BaseItem from "../base-item";
import LightArrow from "../../../assets/svgs/arrows/light-left.svg";

const Wrapper = styled.div`
  flex: 1;
  width: 238px;
  height: auto;
  background: ${({ theme }) => theme.whiteBackground};
  padding: 16px 0px;
  display: grid;
  grid-template-rows: repeat(auto-fill, minmax(0, 45px));
`;

export const StyledBaseItem = styled(BaseItem)`
  position: relative;

  svg {
    position: absolute;
    transform: rotate(180deg);
    right: 16px;
    fill: ${({ selected, theme }) =>
      selected ? theme.primaryBlue : theme.stroke};
  }
`;

export interface IItem {
  label: string;
  value: number | string;
  children?: IItem[];
}

interface IItemContainer {
  layer: { items: IItem[]; selected?: IItem["value"] };
  onChange: (item: IItem) => void;
}

const ItemContainer: React.FC<IItemContainer> = ({ layer, onChange }) => (
  <Wrapper>
    {layer.items.map((item, i) => (
      <StyledBaseItem
        key={i}
        text={item.label}
        icon={item.children && <LightArrow />}
        onClick={() => onChange(item)}
        selected={item.value === layer.selected}
      />
    ))}
  </Wrapper>
);

export default ItemContainer;
