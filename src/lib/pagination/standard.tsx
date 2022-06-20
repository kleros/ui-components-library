import React from "react";
import styled from "styled-components";
import usePagination from "../../hooks/pagination/use-pagination";
import Arrow from "../../assets/svgs/arrows/light-left.svg";
import { borderBox, button, svg } from "../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PageButton = styled.button<{ selected?: boolean }>`
  ${button}
  height: 32px;
  width: 32px;
  margin: 4px;
  background: ${(props) =>
    props.selected ? props.theme.lightBlue : props.theme.whiteBackground};
  border: 1px solid
    ${(props) =>
      props.selected ? props.theme.primaryBlue : props.theme.stroke};
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  color: ${(props) =>
    props.selected ? props.theme.primaryBlue : props.theme.primaryText};

  :hover:enabled {
    background: ${(props) =>
      props.selected ? props.theme.whiteBackground : props.theme.lightBlue};
    border: 1px solid
      ${(props) =>
        props.selected ? props.theme.primaryBlue : props.theme.secondaryBlue};
    color: ${(props) =>
      props.selected ? props.theme.primaryBlue : props.theme.secondaryBlue};
  }
`;

const StyledArrow = styled.svg``;

const ArrowButton = styled(PageButton)`
  & ${StyledArrow} {
    ${svg}
    fill: ${(props) =>
      props.disabled ? props.theme.stroke : props.theme.primaryText};
    transition: fill ease ${({ theme }) => theme.transitionSpeed};
  }

  :hover:enabled {
    & ${StyledArrow} {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

const LeftArrow = styled(ArrowButton)`
  & ${StyledArrow} {
    padding-right: 1px;
  }
`;

const RightArrow = styled(ArrowButton)`
  & ${StyledArrow} {
    padding-left: 1px;
    transform: rotate(180deg);
  }
`;

interface CompactPaginationProps {
  currentPage: number;
  numPages: number;
  //eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
  className?: string;
}

const CompactPagination: React.FC<CompactPaginationProps> = ({
  currentPage,
  numPages,
  callback,
  className,
}) => {
  const [
    {
      incrementPage,
      decrementPage,
      goToPage,
      minPageReached,
      maxPageReached,
      getPageRange,
    },
  ] = usePagination(currentPage, numPages, callback);

  return (
    <Wrapper {...{ className }}>
      <LeftArrow disabled={minPageReached} onClick={decrementPage}>
        <Arrow className={StyledArrow.styledComponentId} />
      </LeftArrow>
      {getPageRange().map((i) => (
        <PageButton
          key={i}
          selected={currentPage === i}
          onClick={() => goToPage(i)}
        >
          {i}
        </PageButton>
      ))}
      <RightArrow disabled={maxPageReached} onClick={incrementPage}>
        <Arrow className={StyledArrow.styledComponentId} />
      </RightArrow>
    </Wrapper>
  );
};

export default CompactPagination;
