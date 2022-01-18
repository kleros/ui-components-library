import React, { useState } from "react";
import styled from "styled-components";
import ItemContainer, { IItem } from "./item-container";
import Selector from "./selector";

interface ILayer {
  items: IItem[];
  selected?: IItem["value"];
}

const Wrapper = styled.div<{ path: ILayer[] }>`
  background: ${({ theme }) => theme.stroke};
  padding: 1px;
  border-radius: 3px;
  display: grid;
  grid-template-columns: repeat(${({ path }) => path.length}, 235px);
  grid-template-rows: 350px 64px;
  gap: 1px;
`;

interface ICascader {
  items: IItem[];
  onSelect: (value: IItem["value"]) => void;
}

const Cascader: React.FC<ICascader> = ({ items, onSelect }) => {
  const [path, setPath] = useState<ILayer[]>([{ items }]);
  const [selected, setSelected] = useState<IItem>();
  return (
    <Wrapper {...{ path }}>
      {path.map((layer, depth) => (
        <ItemContainer
          layer={layer}
          onChange={(item: IItem) => {
            let newPath;
            if (depth < path.length) newPath = path.slice(0, depth + 1);
            else newPath = path;
            newPath[depth].selected = item.value;
            if (item.children) newPath.push({ items: item.children });
            setPath(newPath);
            setSelected(item);
          }}
          key={depth}
        />
      ))}
      <Selector
        onSelect={() => (selected ? onSelect(selected.value) : "")}
        currentSelection={selected?.label}
      />
    </Wrapper>
  );
};

export default Cascader;
