import { useState } from "react";

const PaginationLogic = ({ render, callback, numPages }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const incrementPage = () => {
    const newPage = Math.min(numPages, currentPage + 1);
    callback(newPage);
    setCurrentPage(newPage);
  };

  const decrementPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    callback(newPage);
    setCurrentPage(newPage);
  };

  return render({
    decrementPage,
    incrementPage,
    disableDecrement: currentPage === 1,
    disableIncrement: currentPage === numPages,
  });
};

export default PaginationLogic;
