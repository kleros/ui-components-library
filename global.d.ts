import "styled-components";

declare global {
  module "*.svg" {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
  }
}

declare module "styled-components" {
  export interface DefaultTheme {
    primaryPurple: string;
    secondaryPurple: string;
    mediumPurple: string;
    lightPurple: string;
    primaryBlue: string;
    secondaryBlue: string;
    mediumBlue: string;
    lightBlue: string;
    primaryText: string;
    secondaryText: string;
    stroke: string;
    lightGrey: string;
    offGrey: string;

    whiteBackground: string;
    lightBackground: string;

    defaultShadow: string;
    hoveredShadow: string;

    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    tint: string;
    tintMedium: string;
    tintPurple: string;

    transitionSpeed: string;
  }
}
