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
import Field from "./lib/form/field";
import Textarea from "./lib/form/textarea";
import DisplaySmall from "./lib/display/small";
import Dai from "./assets/svgs/dai.svg";
import DisplayLarge from "./lib/display/large";
import DisplayIcon from "./lib/display/icon";
import Balance from "./assets/svgs/balance.svg";
import CompactPagination from "./lib/pagination/compact";
import StandardPagination from "./lib/pagination/standard";
import FileUploader from "./lib/form/file-uploader";
import Breadcrumb from "./lib/breadcrumb";

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
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <StyledDiv>
          <Button
            primary
            text={"Change Theme"}
            onClick={() =>
              theme === lightTheme ? setTheme(darkTheme) : setTheme(lightTheme)
            }
          />
          <Button primary small text={"Get help"} icon={<Telegram />} />
          <Button primary disabled text={"Hello"} />
          <Button secondary text={"Hello"} />
          <Button tertiary small text={"Hello"} />
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
          <Field placeholder={"eg. Escrow"} success />
          <Textarea
            placeholder={"eg. longer text"}
            message={"Error msg"}
            error
          />
          <DisplaySmall text="250 DAI" label="Amount" icon={<Dai />} />
          <DisplayLarge text="$244.08" label="ETH Price" icon={<Dai />} />
          <DisplayIcon text="247" label="Disputes" icon={<Balance />} />
          <CompactPagination
            currentPage={currentPage}
            label={<p style={{ fontSize: "14px" }}>Page {currentPage}</p>}
            callback={setCurrentPage}
            numPages={6}
          />
          <StandardPagination
            currentPage={currentPage}
            label={<p style={{ fontSize: "14px" }}>Page {currentPage}</p>}
            callback={setCurrentPage}
            numPages={6}
          />
          <FileUploader callback={() => {}} info msg="Some msg" />
          <Breadcrumb
            items={[
              { text: "General Court", value: 0 },
              { text: "Blockchain", value: 1 },
              { text: "Non-Technical", value: 2 },
            ]}
            callback={() => {}}
          />
        </StyledDiv>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
