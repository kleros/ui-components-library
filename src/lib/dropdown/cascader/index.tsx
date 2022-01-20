import React, { useState, useRef } from "react";
import styled, { css } from "styled-components";
import useFocusOutside from "../../../hooks/use-focus-outside";
import ItemContainer, { IItem, StyledBaseItem } from "./item-container";
import DropdownButton from "../button";
import Selector from "./selector";

interface ILayer {
  items: IItem[];
  selected?: IItem["value"];
}

const DropdownContainer = styled.div<{ path: ILayer[]; isOpen: boolean }>`
  ${({ theme, path, isOpen }) => css`
    position: absolute;
    z-index: 100;
    overflow: hidden;
    height: ${isOpen ? "auto" : "0px"};
    box-shadow: 0px 2px 3px ${theme.defaultShadow};
    transition: height ease ${theme.transitionSpeed};
    background: ${theme.stroke};
    padding: ${isOpen ? "1px" : "0"};
    border-radius: 3px;
    display: grid;
    grid-template-columns: repeat(${path.length}, 238px);
    grid-template-rows: max-content 64px;
    gap: 1px;
  `}
`;

const ItemContainerWrapper = styled.div`
  width: auto;
  max-height: 350px;
  background: ${({ theme }) => theme.whiteBackground};
  overflow: auto;
`;

interface ICascader {
  items: IItem[];
  onSelect: (value: IItem["value"]) => void;
  placeholder: string;
}

const Cascader: React.FC<ICascader> = ({
  items,
  onSelect,
  placeholder,
  ...props
}) => {
  const [path, setPath] = useState<ILayer[]>([{ items }]);
  const [current, setCurrent] = useState<IItem>();
  const [selected, setSelected] = useState<IItem>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  return (
    <div ref={containerRef} {...props}>
      <DropdownButton
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        node={
          selected ? (
            <StyledBaseItem current text={selected.label} />
          ) : (
            <StyledBaseItem current text={placeholder} />
          )
        }
      />
      <DropdownContainer {...{ path, isOpen }}>
        {path.map((layer, depth) => (
          <ItemContainerWrapper key={depth}>
            <ItemContainer
              layer={layer}
              onChange={(item: IItem) => {
                let newPath;
                if (depth < path.length) newPath = path.slice(0, depth + 1);
                else newPath = path;
                newPath[depth].selected = item.value;
                if (item.children) newPath.push({ items: item.children });
                setPath(newPath);
                setCurrent(item);
              }}
            />
          </ItemContainerWrapper>
        ))}
        <Selector
          onSelect={() => {
            if (current) {
              onSelect(current.value);
              setSelected(current);
            }
          }}
          currentSelection={current?.label}
        />
      </DropdownContainer>
    </div>
  );
};

export default Cascader;
