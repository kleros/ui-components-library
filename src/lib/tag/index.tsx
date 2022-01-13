import React from "react";
import styled from "styled-components";

interface BaseTagProps {
  active?: boolean;
}

const BaseTag = styled.button<BaseTagProps>`
  height: 32px;
  background: ${({ theme }) => theme.mediumBlue};
  border: ${({ theme, active }) =>
    active ? `1px solid ${theme.primaryBlue}` : "none"};
  border-radius: 300px;
  padding: 0 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    color: ${({ theme }) => theme.primaryBlue};
  }
`;

interface TagProps extends BaseTagProps {
  text: string;
}

const Tag: React.FC<TagProps> = ({ text, active, ...props }) => (
  <BaseTag active={active} {...props}>
    <p>{text}</p>
  </BaseTag>
);

export default Tag;
