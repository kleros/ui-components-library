import React, { useState } from "react";
import CompactPagination from "../lib/pagination/compact";
import StandardPagination from "../lib/pagination/standard";
import Tabs from "../lib/pagination/tabs";
import Telegram from "../assets/svgs/telegram.svg";
import Breadcrumb from "../lib/breadcrumb";

const Pagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <>
      <CompactPagination
        currentPage={currentPage}
        label={<p style={{ fontSize: "14px" }}>Page {currentPage}</p>}
        callback={setCurrentPage}
        numPages={6}
      />
      <StandardPagination
        currentPage={currentPage}
        callback={setCurrentPage}
        numPages={6}
      />
      <Tabs
        className="w-[500px]"
        defaultSelectedKey={"hello"}
        panelClassName="bg-klerosUIComponentsLightBlue p-4"
        items={[
          { text: "hello", value: 0, id: "hello", content: <p>hello</p> },
          {
            text: "Telegram",
            value: 1,
            Icon: Telegram,
            id: "telegram",
            content: <p>Telegram</p>,
          },
          {
            text: "disabled",
            value: 2,
            disabled: true,
            id: "disabled",
            content: <p>Disabled</p>,
          },
        ]}
      />
      <Breadcrumb
        items={[
          { text: "General Court", value: 0 },
          { text: "Blockchain", value: 1 },
          { text: "Non-Technical", value: 2 },
        ]}
      />
    </>
  );
};

export default Pagination;
