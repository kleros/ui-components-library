import React from "react";
import styled from "styled-components";
import { borderBox } from "../../styles/common-style";
import SearchIcon from "../../assets/svgs/form/search.svg";
import Field from "./text-field";

const Wrapper = styled.div`
  ${borderBox}
  position: relative;
  width: 278px;
`;

const StyledField = styled(Field)`
  height: 100%;
  width: 100%;

  input {
    padding: 14px 16px 14px 40px;
  }
`;

const StyledSearchIcon = styled(SearchIcon)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);

  width: 16px;
  height: 16px;
  max-width: 16px;
  max-height: 16px;

  fill: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

const Searchbar: React.FC<React.ComponentProps<typeof Field>> = ({
  ...props
}) => (
  <Wrapper>
    <StyledField placeholder="Search" {...props} />
    <StyledSearchIcon />
  </Wrapper>
);

export default Searchbar;
