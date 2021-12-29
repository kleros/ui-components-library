import React, { useState } from "react";
import CompactPagination from "../lib/pagination/compact";
import StandardPagination from "../lib/pagination/standard";
import Tabs from "../lib/pagination/tabs";
import Telegram from "../assets/svgs/telegram.svg";

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
        label={<p style={{ fontSize: "14px" }}>Page {currentPage}</p>}
        callback={setCurrentPage}
        numPages={6}
      />
      <Tabs
        items={[
          { text: "hello", value: 0 },
          { text: "Telegram", value: 1, icon: <Telegram /> },
          { text: "hello1", value: 2, disabled: true },
        ]}
        callback={() => {}}
        currentValue={0}
      />
    </>
  );
};

export default Pagination;
