import React, { ReactNode } from "react";
import styled from "styled-components";
import usePagination from "../../hooks/pagination/use-pagination";
import Arrow from "../../assets/svgs/arrows/circle-left.svg";
import { borderBox, button, small, svg } from "../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  display: flex;
  align-items: center;
  justify-content: end;
`;

const StyledSVG = styled.svg``;

const ArrowButton = styled.button`
  ${button}
  height: 24px;
  width: 24px;
  background: none;
  padding: 0;
  border-radius: 50%;

  & ${StyledSVG} {
    ${svg}
    height: 24px;
    width: 24px;
    fill: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsStroke
        : props.theme.klerosUIComponentsPrimaryBlue};
    transition: fill ease
      ${({ theme }) => theme.klerosUIComponentsTransitionSpeed};
  }

  :hover:enabled {
    & ${StyledSVG} {
      fill: ${({ theme }) => theme.klerosUIComponentsSecondaryBlue};
    }
  }
`;

const StyledLabel = styled.small`
  ${small}
  color: ${(props) => props.theme.klerosUIComponentsPrimaryText};
`;

const LeftArrow = styled(ArrowButton)`
  margin-left: 16px;
`;

const RightArrow = styled(ArrowButton)`
  margin-left: 8px;

  & ${StyledSVG} {
    transform: rotate(180deg);
  }
`;

interface CompactPaginationProps {
  currentPage: number;
  numPages: number;
  //eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
  label?: ReactNode;
  className?: string;
}

const CompactPagination: React.FC<CompactPaginationProps> = ({
  currentPage,
  numPages,
  callback,
  label,
  className,
}) => {
  const [{ incrementPage, decrementPage, minPageReached, maxPageReached }] =
    usePagination(currentPage, numPages, callback);

  return (
    <Wrapper {...{ className }}>
      <StyledLabel>{label}</StyledLabel>
      <LeftArrow disabled={minPageReached} onClick={decrementPage}>
        <Arrow className={StyledSVG.styledComponentId} />
      </LeftArrow>
      <RightArrow disabled={maxPageReached} onClick={incrementPage}>
        <Arrow className={StyledSVG.styledComponentId} />
      </RightArrow>
    </Wrapper>
  );
};

export default CompactPagination;
