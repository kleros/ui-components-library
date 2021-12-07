import React from "react";
import styled from "styled-components";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global-style";
import { lightTheme, darkTheme } from "./styles/themes";
import Button from "./lib/button";
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
  background: ${props => props.theme.background};
`

const App = () => (
  <React.StrictMode>
    <ThemeProvider theme={lightTheme}>
      <GlobalStyle />
      <StyledDiv>
        <Button primary
          onClick={() => {console.log("hey")}}
          content={{text: "hello"}}
        />
        <Button primary small
          onClick={() => {console.log("hey")}}
          content={{text: "Get help", icon: <Telegram />}}
        />
        <Button primary disabled
          onClick={() => {console.log("hey")}}
          content={{text: "hello"}}
        />
        <Button secondary
          onClick={() => {console.log("hey")}}
          content={{text: "hello"}}
        />
        <Button tertiary small
          onClick={() => {console.log("hey")}}
          content={{text: "hello"}}
        />
        <Card hover round />
        <Accordion items={[{title: "How it works?", body: "hello"}, {title: "How it works?", body: "hello"}]}/>
      </StyledDiv>
    </ThemeProvider>
  </React.StrictMode>
);

export default App;
