import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import styled from "styled-components";
import { borderBox } from "../styles/common-style";

const CustomScrollbarContainer = styled(SimpleBar)`
  ${borderBox}
  .simplebar-scrollbar:before {
    background: ${({ theme }) => theme.primaryBlue};
  }
  .simplebar-scrollbar.simplebar-visible:before {
    opacity: 1;
  }
  .simplebar-mask {
    background: ${({ theme }) => theme.whiteBackground};
`;

export default CustomScrollbarContainer;
