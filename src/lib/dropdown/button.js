import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Arrow from "../../assets/svgs/dropdown/arrow.svg";

const Container = styled.div`
  width: 240px;
  background: ${(props) => props.theme.lightBackground};
  border: 1px solid ${(props) => props.theme.stroke};
  box-sizing: border-box;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 16px;
`;

const StyledArrow = styled(Arrow)`
  width: 16px;
  height: 16px;
  fill: ${(props) => props.theme.stroke};
  ${(props) => (props.isOpen ? "transform: rotate(180deg)" : "")};
  transition: transform ease 0.5s;
`;

const DropdownButton = ({ current, isOpen, setIsOpen }) => {
  return (
    <Container onClick={() => setIsOpen(!isOpen)}>
      {current}
      <StyledArrow isOpen={isOpen} />
    </Container>
  );
};

DropdownButton.propTypes = {
  current: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default DropdownButton;
