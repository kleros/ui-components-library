import React, { useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global-style";
import { lightTheme, darkTheme } from "./styles/themes";
import Button from "./lib/button";
import Box from "./lib/container/box";
import Card from "./lib/container/card";
import Telegram from "./assets/svgs/telegram.svg";
import Accordion from "./lib/accordion";
import DropdownSelect from "./lib/dropdown/select";
import FormField from "./lib/form-field";

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
  background: ${(props) => props.theme.lightBackground};
  transition: background ease ${(props) => props.theme.transitionSpeed};
`;

const App = () => {
  const [theme, setTheme] = useState(lightTheme);
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <StyledDiv>
          <Button
            primary
            onClick={() =>
              theme === lightTheme ? setTheme(darkTheme) : setTheme(lightTheme)
            }
          >
            Change Theme
          </Button>
          <Button primary small>
            <Telegram />
            Get help
          </Button>
          <Button primary disabled>
            Hello
          </Button>
          <Button secondary>Hello</Button>
          <Button tertiary small>
            Hello
          </Button>
          <Card hover round />
          <Box />
          <Accordion
            items={[
              {
                title: "How it works?",
                body: <p>{"hello\nhello\n\n\n\n\nhello"}</p>,
              },
              { title: "How it works?", body: "hello" },
            ]}
          />
          <DropdownSelect
            items={[
              { text: "hello 1", dot: "red", value: 1 },
              { text: "hello 2", dot: "blue", value: 0 },
            ]}
            defaultValue={0}
            callback={() => {}}
          />
          <FormField success />
        </StyledDiv>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
