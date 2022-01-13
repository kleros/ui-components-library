const usePagination = (
  currentPage: number,
  numPages: number,
  //eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function,
  numNeighbors = 2
) => {
  const incrementPage = () => {
    const newPage = Math.min(numPages, currentPage + 1);
    callback(newPage);
  };

  const decrementPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    callback(newPage);
  };

  const goToPage = (newPage: number) => {
    callback(newPage);
  };

  const minPageReached = currentPage === 1;
  const maxPageReached = currentPage === numPages;

  const getPageRange = () => {
    const leftBoundary = Math.max(
      1,
      currentPage -
        numNeighbors -
        Math.max(0, numNeighbors - (numPages - currentPage))
    );
    const rightBoundary = Math.min(
      numPages,
      currentPage + numNeighbors + Math.max(0, numNeighbors - currentPage + 1)
    );
    return [...Array(rightBoundary - leftBoundary + 1).keys()].map(
      (i) => i + leftBoundary
    );
  };

  return [
    {
      incrementPage,
      decrementPage,
      goToPage,
      minPageReached,
      maxPageReached,
      getPageRange,
    },
  ];
};

export default usePagination;
