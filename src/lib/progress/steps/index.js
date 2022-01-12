import React from "react";
import PropTypes from "prop-types";
import Vertical from "./vertical";
import Horizontal from "./horizontal";

const Steps = ({ horizontal, ...props }) => {
  if (horizontal) return <Horizontal {...props} />;
  else return <Vertical {...props} />;
};

Steps.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      subitems: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  currentItemIndex: PropTypes.number.isRequired,
  horizontal: PropTypes.bool,
};

export default Steps;
