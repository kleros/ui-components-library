import React from "react";
import PropTypes from "prop-types";
import styled, { withTheme } from "styled-components";
import RCSlider from "rc-slider";
import Handle from "./handle";
import "rc-slider/assets/index.css";

const Wrapper = styled.div`
  width: 500px;
`;

const StyledSlider = styled(RCSlider)`
  width: 100%;
  .rc-slider-handle-click-focused:focus {
    border-color: ${(props) => props.theme.primaryBlue};
  }
`;

const Slider = (props) => (
  <Wrapper>
    <StyledSlider
      handle={({ ref: ignored, ...handleProps }) => (
        <Handle label={props.label} {...handleProps} />
      )}
      railStyle={{
        height: "8px",
        backgroundColor: props.theme.stroke,
        borderRadius: "30px",
        cursor: "pointer",
      }}
      trackStyle={[
        {
          height: "8px",
          backgroundColor: props.theme.primaryBlue,
          borderRadius: "30px",
          cursor: "pointer",
        },
      ]}
    />
  </Wrapper>
);

Slider.propTypes = {
  theme: PropTypes.shape().isRequired,
  label: PropTypes.string,
};

export default withTheme(Slider);
