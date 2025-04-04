import React from "react";
import Vertical from "./vertical";
import Horizontal from "./horizontal";

interface StepItem {
  /** Title of the step. */
  title: string;
  /** Optional sub-steps of the step. */
  subitems?: string[];
}

export interface StepsProps {
  items: StepItem[];
  currentItemIndex: number;
  /** Flag to display steps in horizontal orientation. */
  horizontal?: boolean;
  className?: string;
}
/** Steps display progress in deterministic steps. */
function Steps({ horizontal = false, ...props }: Readonly<StepsProps>) {
  return horizontal ? <Horizontal {...props} /> : <Vertical {...props} />;
}

export default Steps;
