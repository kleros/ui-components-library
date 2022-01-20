import styled, { css } from "styled-components";
import BaseItem from "../base-item";

const SelectItem = styled(BaseItem)`
  ${({ theme, selected, current }) =>
    css`
      border-left: 3px solid
        ${selected ? theme.primaryBlue : theme.whiteBackground};

      ${!current &&
      css`
        :hover {
          border-left: 3px solid
            ${selected ? theme.primaryBlue : theme.mediumBlue};
        }
      `}
    `}
`;

export default SelectItem;
