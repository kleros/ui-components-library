import { createRoot } from "react-dom/client";
import React, { useState } from "react";
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
import Form from "./examples/form";
import Dropdowns from "./examples/dropdowns";
import Displays from "./examples/displays";
import Messages from "./examples/messages";
import Progress from "./examples/progress";
import TimelineProgress from "./examples/timeline";
import Input from "./examples/input";
import Tooltips from "./examples/tooltip";
import Copiable from "./examples/copiable";

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
  overflow: scroll;
  background: ${(props) => props.theme.klerosUIComponentsLightBackground};
  transition: background ease
    ${(props) => props.theme.klerosUIComponentsTransitionSpeed};
`;

const StyledCard = styled(Card)`
  height: 500px;
  width: 1000px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 24px;
  overflow: auto;
  flex-wrap: wrap;
  padding: 36px 36px;
  background: ${(props) => props.theme.klerosUIComponentsLightBackground};
  transition: background ease
    ${(props) => props.theme.klerosUIComponentsTransitionSpeed};
`;

const StyledTabs = styled(Tabs)`
  width: 995px;
`;

const App = () => {
  const [theme, setTheme] = useState(lightTheme);
  const [tailwindTheme, setTailwindTheme] = useState("light");
  const [example, setExample] = useState("buttons");

  // temporary
  const changeTheme = () => {
    if (tailwindTheme === "dark") {
      document.documentElement.classList.remove("dark");
      setTailwindTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      setTailwindTheme("dark");
    }
    if (theme === lightTheme) setTheme(darkTheme);
    else setTheme(lightTheme);
  };

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
              { text: "Form", value: "form" },
              { text: "Dropdowns", value: "dropdowns" },
              { text: "Displays", value: "displays" },
              { text: "Messages", value: "messages" },
              { text: "Timeline", value: "timeline" },
              { text: "Progress", value: "progress" },
              { text: "Input", value: "input" },
              { text: "Tooltip", value: "tooltip" },
              { text: "Copiable", value: "copiable" },
            ]}
            callback={setExample}
            currentValue={example}
          />
          <StyledCard>
            {example === "buttons" && <Buttons />}
            {example === "pagination" && <Pagination />}
            {example === "containers" && <Containers />}
            {example === "accordion" && <Accordion />}
            {example === "form" && <Form />}
            {example === "dropdowns" && <Dropdowns />}
            {example === "displays" && <Displays />}
            {example === "messages" && <Messages />}
            {example === "timeline" && <TimelineProgress />}
            {example === "progress" && <Progress />}
            {example === "input" && <Input />}
            {example === "tooltip" && <Tooltips />}
            {example === "copiable" && <Copiable />}
          </StyledCard>
          <Button
            variant="primary"
            className="mt-16"
            text={"Change theme"}
            onClick={changeTheme}
          />
        </StyledDiv>
      </ThemeProvider>
    </React.StrictMode>
  );
};

const app = document.getElementById("app");
if (app) {
  const root = createRoot(app);
  root.render(<App />);
}
