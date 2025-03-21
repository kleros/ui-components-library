import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global-style";
import { lightTheme, darkTheme } from "./styles/themes";
import Button from "./lib/button";
import Tabs from "./lib/pagination/tabs";
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
import clsx from "clsx";

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

const App = () => {
  const [theme, setTheme] = useState(lightTheme);
  const [tailwindTheme, setTailwindTheme] = useState("light");

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
          <Tabs
            className="w-[995px]"
            defaultSelectedKey={"buttons"}
            panelClassName={clsx(
              "h-[500px] w-[1000px] bg-klerosUIComponentsLightBackground",
              "transition-[background] ease-ease",
              "border border-klerosUIComponentsStroke box-border",
              "flex justify-around items-center gap-6 flex-wrap p-9",
              "overflow-auto rounded-base shadow-sm shadow-klerosUIComponentsDefaultShadow-400",
            )}
            items={[
              {
                text: "Buttons",
                value: "buttons",
                id: "buttons",
                content: <Buttons />,
              },
              {
                text: "Pagination",
                value: "pagination",
                id: "pagination",
                content: <Pagination />,
              },
              {
                text: "Containers",
                value: "containers",
                id: "containers",
                content: <Containers />,
              },
              {
                text: "Accordion",
                value: "accordion",
                id: "accordion",
                content: <Accordion />,
              },
              {
                text: "Form",
                value: "form",
                id: "content",
                content: <Form />,
              },
              {
                text: "Dropdowns",
                value: "dropdowns",
                id: "dropdowns",
                content: <Dropdowns />,
              },
              {
                text: "Displays",
                value: "displays",
                id: "displays",
                content: <Displays />,
              },
              {
                text: "Messages",
                value: "messages",
                id: "messages",
                content: <Messages />,
              },
              {
                text: "Timeline",
                value: "timeline",
                id: "timeline",
                content: <TimelineProgress />,
              },
              {
                text: "Progress",
                value: "progress",
                id: "progress",
                content: <Progress />,
              },
              {
                text: "Input",
                value: "input",
                id: "input",
                content: <Input />,
              },
              {
                text: "Tooltip",
                value: "tooltip",
                id: "tooltip",
                content: <Tooltips />,
              },
              {
                text: "Copiable",
                value: "copiable",
                id: "copiable",
                content: <Copiable />,
              },
            ]}
          />
          <Button
            variant="primary"
            className="mt-16"
            text={"Change theme"}
            onPress={changeTheme}
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
