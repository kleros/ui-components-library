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
        items={[
          { text: "hello", value: 0 },
          {
            text: "Telegram",
            value: 1,
            icon: (className: string) => <Telegram {...{ className }} />,
          },
          { text: "hello1", value: 2, disabled: true },
        ]}
        callback={() => {
          // function called when a tab is clicked
        }}
        currentValue={0}
      />
      <Breadcrumb
        items={[
          { text: "General Court", value: 0 },
          { text: "Blockchain", value: 1 },
          { text: "Non-Technical", value: 2 },
        ]}
        callback={() => {
          // executed when an item is clicked passing it's value as argument
        }}
      />
    </>
  );
};

export default Pagination;
