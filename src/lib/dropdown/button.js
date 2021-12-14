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

const StyledArrow = styled(({ ignoredIsOpen, ...props }) => (
  <Arrow {...props} />
))`
  width: 16px;
  height: 16px;
  fill: ${(props) => props.theme.stroke};
  ${(props) => (props.ignoredIsOpen ? "transform: rotate(180deg)" : "")};
  transition: transform ease ${(props) => props.theme.transitionSpeed};
`;

const DropdownButton = ({ node, isOpen, setIsOpen, ...props }) => {
  return (
    <Container onClick={() => setIsOpen(!isOpen)} {...props}>
      {node}
      <StyledArrow ignoredIsOpen={isOpen} {...props} />
    </Container>
  );
};

DropdownButton.propTypes = {
  node: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default DropdownButton;
