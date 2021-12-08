import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global-style";
import { lightTheme } from "./styles/themes";
// import { darkTheme } from "./styles/themes";
import Button from "./lib/button";
import Box from "./lib/box";
import Card from "./lib/card";
import Telegram from "./assets/svgs/telegram.svg";
import Accordion from "./lib/accordion";

const StyledDiv = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 36px 36px;
  background: ${(props) => props.theme.background};
`;

const App = () => (
  <React.StrictMode>
    <ThemeProvider theme={lightTheme}>
      <GlobalStyle />
      <StyledDiv>
        <Button primary content={{ text: "hello" }} />
        <Button
          primary
          small
          content={{ text: "Get help", icon: <Telegram /> }}
        />
        <Button primary disabled content={{ text: "hello" }} />
        <Button secondary content={{ text: "hello" }} />
        <Button tertiary small content={{ text: "hello" }} />
        <Card hover round />
        <Box />
        <Accordion
          items={[
            { title: "How it works?", body: "hello" },
            { title: "How it works?", body: "hello" },
          ]}
        />
      </StyledDiv>
    </ThemeProvider>
  </React.StrictMode>
);

export default App;
