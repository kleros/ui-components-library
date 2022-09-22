import React from "react";
import Vertical from "./vertical";
import Horizontal from "./horizontal";

interface StepItem {
  title: string;
  subitems?: string[];
}

export interface StepsProps {
  items: StepItem[];
  currentItemIndex: number;
  horizontal?: boolean;
}

const Steps: React.FC<StepsProps> = ({ horizontal, ...props }) =>
  horizontal ? <Horizontal {...props} /> : <Vertical {...props} />;

export default Steps;
