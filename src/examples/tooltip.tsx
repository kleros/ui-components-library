import React from "react";
import Tag from "../lib/tag";
import styled, { css } from "styled-components";
import Tooltip from "../lib/tooltip";
import Card from "../lib/container/card";

const StyledText = styled.p`
  ${({ theme }) => css`
    color: ${theme.primaryText};
  `}
`;

const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SimpleContainer = styled.div`
  margin: 10px 0;
`;

const SHORT_TEXT = "24.35 $USD";
const LONG_TEXT =
  "Risk/Reward is the ratio between Reward (USD) and Vote Stake(USD)";

const Tooltips: React.FC = () => (
  <>
    <VerticalContainer>
      <SimpleContainer>
        <Tooltip small text={SHORT_TEXT}>
          <Tooltip small place="bottom" text={SHORT_TEXT}>
            <Tooltip small place="right" text={SHORT_TEXT}>
              <Tooltip small place="left" text={SHORT_TEXT}>
                <StyledText>{"Hover me, I'm simple text"}</StyledText>
              </Tooltip>
            </Tooltip>
          </Tooltip>
        </Tooltip>
      </SimpleContainer>
      <SimpleContainer>
        <Tooltip small text={SHORT_TEXT}>
          <Tooltip small place="bottom" text={SHORT_TEXT}>
            <Tooltip small place="right" text={SHORT_TEXT}>
              <Tooltip small place="left" text={SHORT_TEXT}>
                <Tag active text="Hover me, I'm a tag" />
              </Tooltip>
            </Tooltip>
          </Tooltip>
        </Tooltip>
      </SimpleContainer>
    </VerticalContainer>
    <Tooltip small text={SHORT_TEXT}>
      <Tooltip small place="bottom" text={SHORT_TEXT}>
        <Tooltip small place="right" text={SHORT_TEXT}>
          <Tooltip small place="left" text={SHORT_TEXT}>
            <Card>
              <StyledText>{"Hover me, I'm a card"}</StyledText>
            </Card>
          </Tooltip>
        </Tooltip>
      </Tooltip>
    </Tooltip>
    <VerticalContainer>
      <SimpleContainer>
        <Tooltip text={LONG_TEXT}>
          <Tooltip place="bottom" text={LONG_TEXT}>
            <StyledText>Big tooltips horizontal</StyledText>
          </Tooltip>
        </Tooltip>
      </SimpleContainer>
      <SimpleContainer>
        <Tooltip place="right" text={LONG_TEXT}>
          <Tooltip place="left" text={LONG_TEXT}>
            <StyledText>Big tooltips vertical</StyledText>
          </Tooltip>
        </Tooltip>
      </SimpleContainer>
    </VerticalContainer>
  </>
);

export default Tooltips;
