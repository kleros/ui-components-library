import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const BaseTag = styled.div`
  height: 32px;
  background: ${(props) => props.theme.mediumBlue};
  border: ${(props) =>
    props.active ? `1px solid ${props.theme.primaryBlue}` : "none"};
  border-radius: 300px;
  padding: 0 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    color: ${(props) => props.theme.primaryBlue};
  }
`;

const Tag = ({ text, active }) => (
  <BaseTag active={active}>
    <p>{text}</p>
  </BaseTag>
);

Tag.propTypes = {
  text: PropTypes.string,
  active: PropTypes.bool,
};

export default Tag;
