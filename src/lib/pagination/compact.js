import React from "react";
import PropTypes from "prop-types";
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
    transition: fill ease ${(props) => props.theme.transitionSpeed};
  }

  :hover:enabled {
    svg {
      fill: ${(props) => props.theme.secondaryBlue};
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

const CompactPagination = ({ currentPage, numPages, callback, label }) => {
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

CompactPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  numPages: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
  label: PropTypes.node,
};

export default CompactPagination;