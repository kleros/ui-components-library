import React, { ReactNode } from "react";
import styled from "styled-components";
import usePagination from "../../hooks/pagination/use-pagination";
import Arrow from "../../assets/svgs/pagination/left-arrow.svg";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
`;

const ArrowButton = styled.button`
  height: 24px;
  width: 24px;
  background: none;
  padding: 0;
  border-radius: 50%;

  svg {
    height: 24px;
    width: 24px;
    fill: ${(props) =>
      props.disabled ? props.theme.stroke : props.theme.primaryBlue};
    transition: fill ease ${({ theme }) => theme.transitionSpeed};
  }

  :hover:enabled {
    svg {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

const LeftArrow = styled(ArrowButton)`
  margin-left: 16px;
`;

const RightArrow = styled(ArrowButton)`
  margin-left: 8px;

  svg {
    transform: rotate(180deg);
  }
`;

interface CompactPaginationProps {
  currentPage: number;
  numPages: number;
  //eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
  label?: ReactNode;
}

const CompactPagination: React.FC<CompactPaginationProps> = ({
  currentPage,
  numPages,
  callback,
  label,
}) => {
  const [{ incrementPage, decrementPage, minPageReached, maxPageReached }] =
    usePagination(currentPage, numPages, callback);

  return (
    <Wrapper>
      {label}
      <LeftArrow disabled={minPageReached} onClick={decrementPage}>
        <Arrow />
      </LeftArrow>
      <RightArrow disabled={maxPageReached} onClick={incrementPage}>
        <Arrow />
      </RightArrow>
    </Wrapper>
  );
};

export default CompactPagination;
