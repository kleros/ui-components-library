import React from "react";
import PropTypes from "prop-types";
import styled, { withTheme } from "styled-components";
import RCSlider from "rc-slider";
import Handle from "./handle";
import "rc-slider/assets/index.css";

const Wrapper = styled.div`
  width: 500px;
  margin-top: 30px;
`;

const StyledSlider = styled(RCSlider)`
  width: 100%;
  .rc-slider-handle-click-focused:focus {
    border-color: ${(props) => props.theme.primaryBlue};
  }
`;

const Labels = styled.div`
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  small {
    color: ${(props) => props.theme.primaryText};
  }
`;

const Slider = ({
  label,
  min,
  max,
  leftLabel,
  rightLabel,
  callback,
  ...props
}) => (
  <Wrapper>
    <StyledSlider
      handle={({ ref: ignored, ...handleProps }) => (
        <Handle label={label} {...handleProps} />
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
      onChange={callback}
      min={min}
      max={max}
      {...props}
    />
    <Labels>
      {leftLabel && <small>{leftLabel}</small>}
      {rightLabel && <small>{rightLabel}</small>}
    </Labels>
  </Wrapper>
);

Slider.propTypes = {
  theme: PropTypes.shape().isRequired,
  label: PropTypes.string,
  leftLabel: PropTypes.string.isRequired,
  rightLabel: PropTypes.string.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  callback: PropTypes.func.isRequired,
  ...StyledSlider.propTypes,
};

export default withTheme(Slider);
