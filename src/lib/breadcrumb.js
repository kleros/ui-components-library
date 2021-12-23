import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
`;

const Element = styled.button`
  background: none;
  padding: 0;

  :hover {
    p {
      color: ${(props) => props.theme.primaryText};
    }
  }
`;

const Content = styled.p`
  font-size: 14px;
  color: ${(props) => props.theme.secondaryText};

  transition: color ease ${(props) => props.theme.transitionSpeed};
`;

const Separator = styled(Content)`
  margin: 0px 8px;
`;

const ActiveElement = styled(Content)`
  color: ${(props) => props.theme.primaryText};
`;

const Breadcrumb = ({ callback, items }) => (
  <Wrapper>
    {items.map(({ text, value }, i) =>
      i === items.length - 1 ? (
        <ActiveElement key={i}>{text}</ActiveElement>
      ) : (
        <React.Fragment key={i}>
          <Element onClick={() => callback(value)}>
            <Content>{text}</Content>
          </Element>
          <Separator>{"/"}</Separator>
        </React.Fragment>
      )
    )}
  </Wrapper>
);

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })
  ).isRequired,
  callback: PropTypes.func.isRequired,
};

export default Breadcrumb;
