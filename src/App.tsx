import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled, { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global-style";
import { lightTheme, darkTheme } from "./styles/themes";
import Button from "./lib/button";
import Tabs from "./lib/pagination/tabs";
import Card from "./lib/container/card";
import Buttons from "./examples/buttons";
import Pagination from "./examples/pagination";
import Containers from "./examples/containers";
import Accordion from "./examples/accordion";
import Breadcrumbs from "./examples/breadcrumbs";
import Dropdowns from "./examples/dropdowns";
import Form from "./examples/form";
import Displays from "./examples/displays";
import Messages from "./examples/messages";
import Tags from "./examples/tag";
import Progress from "./examples/progress";

const StyledDiv = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 36px 36px;
  background: ${(props) => props.theme.lightBackground};
  transition: background ease ${(props) => props.theme.transitionSpeed};
`;

const StyledCard = styled(Card)`
  height: 500px;
  width: 1000px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  align-content: space-evenly;
  flex-wrap: wrap;
  padding: 36px 36px;
  background: ${(props) => props.theme.lightBackground};
  transition: background ease ${(props) => props.theme.transitionSpeed};
`;

const StyledTabs = styled(Tabs)`
  width: 995px;
`;

const StyledButton = styled(Button)`
  margin-top: 64px;
`;

const App = () => {
  const [theme, setTheme] = useState(lightTheme);
  const [example, setExample] = useState("buttons");
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <StyledDiv>
          <StyledTabs
            items={[
              { text: "Buttons", value: "buttons" },
              { text: "Pagination", value: "pagination" },
              { text: "Containers", value: "containers" },
              { text: "Accordion", value: "accordion" },
              { text: "Breadcrumbs", value: "breadcrumbs" },
              { text: "Dropdowns", value: "dropdowns" },
              { text: "Form", value: "form" },
              { text: "Displays", value: "displays" },
              { text: "Messages", value: "messages" },
              { text: "Tags", value: "tags" },
              { text: "Progress", value: "progress" },
            ]}
            callback={setExample}
            currentValue={example}
          />
          <StyledCard>
            {example === "buttons" && <Buttons />}
            {example === "pagination" && <Pagination />}
            {example === "containers" && <Containers />}
            {example === "accordion" && <Accordion />}
            {example === "breadcrumbs" && <Breadcrumbs />}
            {example === "dropdowns" && <Dropdowns />}
            {example === "form" && <Form />}
            {example === "displays" && <Displays />}
            {example === "messages" && <Messages />}
            {example === "tags" && <Tags />}
            {example === "progress" && <Progress />}
          </StyledCard>
          <StyledButton
            variant="primary"
            text={"Change theme"}
            onClick={() =>
              theme === lightTheme ? setTheme(darkTheme) : setTheme(lightTheme)
            }
          />
        </StyledDiv>
      </ThemeProvider>
    </React.StrictMode>
  );
};

const app = document.getElementById("app");
ReactDOM.render(<App />, app);
