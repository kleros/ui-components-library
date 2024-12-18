import {
  css,
  DefaultTheme,
  FlattenInterpolation,
  keyframes,
  ThemeProps,
} from "styled-components";

export const mobileStyle = (
  styleFn: () => FlattenInterpolation<ThemeProps<DefaultTheme>>
) => css`
  @media (max-width: 900px) {
    ${styleFn()}
  }
`;

export const h1 = css`
  font-size: 24px;
  font-weight: 600;
  line-height: 33px;
  margin: 0;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

export const h2 = css`
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  margin: 0;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

export const p = css`
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  margin: 0;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  overflow-wrap: break-word;
`;

export const small = css`
  font-size: 14px;
  font-weight: 400;
  line-height: 19px;
  margin: 0;
  color: ${({ theme }) => theme.klerosUIComponentsSecondaryText};
  overflow-wrap: break-word;
`;

export const hr = css`
  opacity: 1;
`;

export const svg = css`
  display: inline-block;
  vertical-align: middle;
`;

export const img = css`
  display: inline-block;
  vertical-align: middle;
`;

export const button = css`
  font-family: inherit;
  font-size: 100%;
  margin: 0;
  border: none;
  overflow: visible;
  text-transform: none;
  -webkit-appearance: button;

  :hover:enabled {
    cursor: pointer;
  }
`;

export const input = css`
  font-family: inherit;
  font-size: 100%;
  margin: 0;
  border: none;
  overflow: visible;
`;

export const optgroup = css`
  font-family: inherit;
  font-size: 100%;
  margin: 0;
  border: none;
`;

export const select = css`
  font-family: inherit;
  font-size: 100%;
  margin: 0;
  border: none;
  text-transform: none;
`;

export const textarea = css`
  font-family: inherit;
  font-size: 100%;
  margin: 0;
  border: none;
`;

export const borderBox = css`
  box-sizing: border-box;
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }
`;

export const hoverShortTransitionTiming = css`
  transition: 0.1s;
`;

export const hoverLongTransitionTiming = css`
  transition: 0.2s;
`;

export const hoverMediumBlue = css`
  :hover {
    background-color: ${(props) => props.theme.klerosUIComponentsMediumBlue};
  }
`;

export const hoverWhiteBackground = css`
  :hover {
    background-color: ${(props) =>
      props.theme.klerosUIComponentsWhiteBackground};
  }
`;

export const fadeIn = keyframes`
  0%{
    opacity: 0;
  }
  50%{
    opacity: 0.5;
  }
  100%{
    opacity: 1;
  }
`;
