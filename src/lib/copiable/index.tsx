import React, { useState } from "react";
import styled from "styled-components";
import Tooltip, { TooltipBaseProps } from "../tooltip";
import Copy from "../../assets/svgs/copiable/copy.svg";
import Copied from "../../assets/svgs/copiable/copied.svg";

interface CopiableBaseProps {
  copiableContent: string;
  info?: string;
}

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const StyledTooltip = styled(Tooltip)`
  > span {
    padding: 8px;
  }
`;

const IconContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 16px;
  height: 16px;
`;

interface CopiableProps extends CopiableBaseProps {
  children?: React.ReactNode;
  tooltipProps?: TooltipBaseProps;
}

/**
 * @description Wraps a component to make it copiable.
 * @param copiableContent The text to be copied to user's clipboard
 * @param info Modify the message displayed in the copy button's tooltip
 * @param tooltipProps Copy button's tooltip props
 */
const Copiable: React.FC<CopiableProps> = ({
  copiableContent,
  info,
  children,
  tooltipProps,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(copiableContent)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => setIsCopied(false));
  };

  return (
    <Wrapper {...props}>
      {children}
      <StyledTooltip
        text={isCopied ? "Copied!" : `${info ?? "Copy"}`}
        {...tooltipProps}
      >
        <IconContainer className="icon-container">
          {isCopied ? (
            <Copied className="copied-icon" />
          ) : (
            <Copy className="copy-icon" onClick={handleCopy} />
          )}
        </IconContainer>
      </StyledTooltip>
    </Wrapper>
  );
};

export default Copiable;
