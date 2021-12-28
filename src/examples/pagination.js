import React, { useState } from "react";
import CompactPagination from "../lib/pagination/compact";
import StandardPagination from "../lib/pagination/standard";
import Tabs from "../lib/pagination/tabs";

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
          { text: "hello1", value: 1 },
          { text: "hello1", value: 2, disabled: true },
        ]}
        callback={() => {}}
        currentValue={0}
      />
    </>
  );
};

export default Pagination;
