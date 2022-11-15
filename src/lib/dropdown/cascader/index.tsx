import React, { useState, useRef, useEffect } from "react";
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
  border: 1px solid ${({ theme }) => theme.stroke};
  ${mobileStyle(css`
    width: 240px;
  `)}
  border-radius: 3px;
`;

const Container = styled.div<{ path: ILayer[]; isOpen: boolean }>`
  ${({ theme, path, isOpen }) => css`
    background: ${isOpen ? theme.stroke : theme.whiteBackground};
    border-bottom: 1px solid ${({ theme }) => theme.stroke};
    border-radius: 3px;
    display: grid;
    grid-template-columns: repeat(${path.length}, 238px) 0px;
    grid-template-rows: max-content;
    gap: 1px;
    ${mobileStyle(css`
      overflow: auto;
    `)}
  `}
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
  const lastElementRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  useEffect(() => {
    if (lastElementRef?.current && isOpen) {
      scrollIntoView(lastElementRef.current);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
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

export default Cascader;
