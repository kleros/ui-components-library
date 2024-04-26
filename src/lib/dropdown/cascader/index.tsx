import React, { useState, useRef, useEffect, useMemo } from "react";
import styled, { css } from "styled-components";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import { mobileStyle } from "../../../styles/common-style";
import useFocusOutside from "../../../hooks/use-focus-outside";
import DropdownContainer from "../dropdown-container";
import ItemContainer, { IItem, StyledBaseItem } from "./item-container";
import DropdownButton from "../button";
import Selector from "./selector";

interface ILayer {
  items: IItem[];
  selected?: IItem["value"];
}

const Wrapper = styled(DropdownContainer)`
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  ${mobileStyle(
    () => css`
      width: 240px;
    `
  )}
  border-radius: 3px;
`;

const Container = styled.div<{ path: ILayer[]; isOpen: boolean }>`
  ${({ theme, path, isOpen }) => css`
    background: ${isOpen
      ? theme.klerosUIComponentsStroke
      : theme.klerosUIComponentsWhiteBackground};
    border-bottom: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
    border-radius: 3px;
    display: grid;
    grid-template-columns: repeat(${path.length}, 238px) 0px;
    grid-template-rows: max-content;
    gap: 1px;
    ${mobileStyle(
      () => css`
        overflow: auto;
      `
    )}
  `}
`;

interface ICascader {
  items: IItem[];
  onSelect: (value: IItem["value"]) => void;
  placeholder: string;
  value?: string | number;
}

const Cascader: React.FC<ICascader> = ({
  items,
  onSelect,
  placeholder,
  value,
  ...props
}) => {
  const [path, setPath] = useState<ILayer[]>([{ items }]);
  const [current, setCurrent] = useState<IItem>();
  const [selected, setSelected] = useState<IItem>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef(null);
  const lastElementRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  useEffect(() => {
    if (lastElementRef?.current && isOpen) {
      scrollIntoView(lastElementRef.current);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const label = useMemo(
    () => (value ? findLabelByValue(items, value) : undefined),
    [items, value]
  );

  return (
    <div ref={containerRef} {...props}>
      <DropdownButton
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        node={
          selected ? (
            <StyledBaseItem current text={selected.label} />
          ) : (
            <StyledBaseItem current text={label ?? placeholder} />
          )
        }
      />
      <Wrapper {...{ isOpen }}>
        <Container {...{ path, isOpen }}>
          {path.map((layer, depth) => (
            <ItemContainer
              key={depth}
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
          ))}
          <div ref={lastElementRef} />
        </Container>
        <Selector
          onSelect={() => {
            if (current) {
              new Promise((resolve) => resolve(onSelect(current.value)))
                .then(() => {
                  setSelected(current);
                  setIsOpen(false);
                })
                .catch((error) => console.error(error));
            }
          }}
          currentSelection={current?.label}
        />
      </Wrapper>
    </div>
  );
};

/**
 * @param nodes the nodes
 * @param targetValue the value to search, can be string or number
 * @returns the label if the item is found, else returns undefined
 */
function findLabelByValue(
  nodes: IItem[],
  targetValue: string | number
): string | undefined {
  for (const node of nodes) {
    if (node.value == targetValue) {
      return node.label;
    }
    if (node.children) {
      const result = findLabelByValue(node.children, targetValue);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

export default Cascader;
