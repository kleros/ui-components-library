import React from "react";
import styled, { withTheme } from "styled-components";
import RCSlider, { SliderProps as RCSliderProps } from "rc-slider";
import Handle from "./handle";
import "rc-slider/assets/index.css";
import { borderBox, small } from "../../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  width: 500px;
  margin-top: 30px;
`;

const StyledSlider = styled(RCSlider)`
  width: 100%;
  .rc-slider-handle-click-focused:focus {
    border-color: ${(props) => props.theme.klerosUIComponentsPrimaryBlue};
  }
`;

const StyledLabel = styled.small`
  ${small}
  color: ${(props) => props.theme.klerosUIComponentsPrimaryText};
`;

const Labels = styled.div`
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

interface SliderBaseProps {
  theme: any; //! type
  label?: string;
  leftLabel: string;
  rightLabel: string;
  min?: number;
  max?: number;

  callback: (value: number) => void;
}

const Slider: React.FC<SliderBaseProps & RCSliderProps> = ({
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
        backgroundColor: props.theme.klerosUIComponentsStroke,
        borderRadius: "30px",
        cursor: "pointer",
      }}
      trackStyle={
        [
          {
            height: "8px",
            backgroundColor: props.theme.klerosUIComponentsPrimaryBlue,
            borderRadius: "30px",
            cursor: "pointer",
          },
        ] as any //! type
      }
      onChange={callback}
      min={min}
      max={max}
      {...props}
    />
    <Labels>
      {leftLabel && <StyledLabel>{leftLabel}</StyledLabel>}
      {rightLabel && <StyledLabel>{rightLabel}</StyledLabel>}
    </Labels>
  </Wrapper>
);

Slider.displayName = "Slider";

export default withTheme(Slider);
