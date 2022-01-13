import React from "react";
import Vertical from "./vertical";
import Horizontal from "./horizontal";

interface StepItem {
  title: string;
  subitems: string[];
}

interface Steps {
  items: StepItem[];
  currentItemIndex: number;
  horizontal?: boolean;
}

interface HorizontalStepItem {
  title: string;
}

interface VerticalStepItem extends HorizontalStepItem {
  subitems?: string[];
}

export interface StepsProps<O extends "horizontal" | "vertical"> {
  items: O extends "horizontal"
    ? [HorizontalStepItem, ...HorizontalStepItem[]]
    : [VerticalStepItem, ...VerticalStepItem[]];
  currentItemIndex: number;
}

const Steps: React.FC<
  StepsProps<"horizontal" | "vertical"> & { horizontal?: boolean }
> = ({ horizontal, ...props }) =>
  horizontal ? <Horizontal {...props} /> : <Vertical {...props} />;

export default Steps;
