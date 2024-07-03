import React, { ReactNode } from "react";
import styled from "styled-components";
import usePagination from "../../hooks/pagination/use-pagination";
import Arrow from "../../assets/svgs/arrows/circle-left.svg";
import SolidErrorIcon from "../../assets/svgs/status-icons/solid-error.svg";
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

const CloseButton = styled(ArrowButton)`
  margin-left: 8px;

  & ${StyledSVG} {
    fill: ${(props) => props.theme.klerosUIComponentsPrimaryBlue};
  }

  :hover:enabled {
    & ${StyledSVG} {
      fill: ${({ theme }) => theme.klerosUIComponentsSecondaryBlue};
    }
  }
`;

interface CompactPaginationProps {
  currentPage: number;
  numPages: number;
  callback: (newPage: number) => void;
  onCloseOnLastPage?: () => void;
  label?: ReactNode;
  className?: string;
}

const CompactPagination: React.FC<CompactPaginationProps> = ({
  currentPage,
  numPages,
  callback,
  onCloseOnLastPage,
  label,
  className,
}) => {
  const [{ incrementPage, decrementPage, minPageReached, maxPageReached }] =
    usePagination(currentPage, numPages, callback, onCloseOnLastPage);

  return (
    <Wrapper {...{ className }}>
      <StyledLabel>{label}</StyledLabel>
      <LeftArrow disabled={minPageReached} onClick={decrementPage}>
        <Arrow className={StyledSVG.styledComponentId} />
      </LeftArrow>
      {currentPage === numPages && onCloseOnLastPage ? (
        <CloseButton onClick={onCloseOnLastPage}>
          <SolidErrorIcon className={StyledSVG.styledComponentId} />
        </CloseButton>
      ) : (
        <RightArrow disabled={maxPageReached} onClick={incrementPage}>
          <Arrow className={StyledSVG.styledComponentId} />
        </RightArrow>
      )}
    </Wrapper>
  );
};

export default CompactPagination;
