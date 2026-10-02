import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import usePagination from "./use-pagination";

type Args = Parameters<typeof usePagination>;

const setup = (
  currentPage: number,
  numPages: number,
  options: { onCloseOnLastPage?: () => void; numNeighbors?: number } = {},
) => {
  const callback = vi.fn<(newPage: number) => void>();
  const { result, rerender } = renderHook(
    (args: Args) => usePagination(...args),
    {
      initialProps: [
        currentPage,
        numPages,
        callback,
        options.onCloseOnLastPage,
        options.numNeighbors,
      ] as Args,
    },
  );
  return { callback, result, rerender, api: () => result.current[0] };
};

describe("usePagination", () => {
  it("returns a single-element tuple with the pagination API", () => {
    const { result } = setup(1, 5);
    expect(result.current).toHaveLength(1);
    expect(Object.keys(result.current[0]).sort()).toEqual([
      "decrementPage",
      "getPageRange",
      "goToPage",
      "incrementPage",
      "maxPageReached",
      "minPageReached",
    ]);
  });

  describe("incrementPage", () => {
    it("moves to the next page in the middle of the range", () => {
      const { api, callback } = setup(3, 10);
      api().incrementPage();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(4);
    });

    it("moves from the penultimate to the last page", () => {
      const onClose = vi.fn();
      const { api, callback } = setup(9, 10, { onCloseOnLastPage: onClose });
      api().incrementPage();
      expect(callback).toHaveBeenCalledWith(10);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onCloseOnLastPage instead of the callback on the last page", () => {
      const onClose = vi.fn();
      const { api, callback } = setup(10, 10, { onCloseOnLastPage: onClose });
      api().incrementPage();
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith();
      expect(callback).not.toHaveBeenCalled();
    });

    it("clamps to the last page when there is no onCloseOnLastPage", () => {
      const { api, callback } = setup(10, 10);
      api().incrementPage();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(10);
    });

    it("clamps an out-of-range current page down to numPages", () => {
      const onClose = vi.fn();
      const { api, callback } = setup(12, 10, { onCloseOnLastPage: onClose });
      api().incrementPage();
      expect(callback).toHaveBeenCalledWith(10);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onCloseOnLastPage for a single page", () => {
      const onClose = vi.fn();
      const { api, callback } = setup(1, 1, { onCloseOnLastPage: onClose });
      api().incrementPage();
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("decrementPage", () => {
    it("moves to the previous page", () => {
      const { api, callback } = setup(5, 10);
      api().decrementPage();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(4);
    });

    it("moves from page 2 to page 1", () => {
      const { api, callback } = setup(2, 10);
      api().decrementPage();
      expect(callback).toHaveBeenCalledWith(1);
    });

    it("stays on page 1 when already on the first page", () => {
      const { api, callback } = setup(1, 10);
      api().decrementPage();
      expect(callback).toHaveBeenCalledWith(1);
    });

    it("clamps an out-of-range current page up to 1", () => {
      const { api, callback } = setup(0, 10);
      api().decrementPage();
      expect(callback).toHaveBeenCalledWith(1);
    });
  });

  describe("goToPage", () => {
    it("forwards the requested page to the callback without clamping", () => {
      const { api, callback } = setup(1, 10);
      api().goToPage(7);
      api().goToPage(42);
      expect(callback.mock.calls).toEqual([[7], [42]]);
    });
  });

  describe("minPageReached / maxPageReached", () => {
    it.each([
      [1, 10, true, false],
      [2, 10, false, false],
      [9, 10, false, false],
      [10, 10, false, true],
      [1, 1, true, true],
      [0, 10, false, false],
    ])("page %i of %i -> min=%s max=%s", (currentPage, numPages, min, max) => {
      const { api } = setup(currentPage, numPages);
      expect(api().minPageReached).toBe(min);
      expect(api().maxPageReached).toBe(max);
    });

    it("updates when the current page changes", () => {
      const { api, rerender, callback } = setup(1, 3);
      expect(api().minPageReached).toBe(true);
      rerender([3, 3, callback, undefined, undefined]);
      expect(api().minPageReached).toBe(false);
      expect(api().maxPageReached).toBe(true);
    });
  });

  describe("getPageRange (default 2 neighbours)", () => {
    it.each<[number, number[]]>([
      [1, [1, 2, 3, 4, 5]],
      [2, [1, 2, 3, 4, 5]],
      [3, [1, 2, 3, 4, 5]],
      [4, [2, 3, 4, 5, 6]],
      [5, [3, 4, 5, 6, 7]],
      [7, [5, 6, 7, 8, 9]],
      [8, [6, 7, 8, 9, 10]],
      [9, [6, 7, 8, 9, 10]],
      [10, [6, 7, 8, 9, 10]],
    ])("page %i of 10 -> %j", (currentPage, expected) => {
      const { api } = setup(currentPage, 10);
      expect(api().getPageRange()).toEqual(expected);
    });

    it.each<[number, number, number[]]>([
      [1, 1, [1]],
      [1, 2, [1, 2]],
      [2, 2, [1, 2]],
      [1, 3, [1, 2, 3]],
      [2, 3, [1, 2, 3]],
      [3, 3, [1, 2, 3]],
      [1, 5, [1, 2, 3, 4, 5]],
      [3, 5, [1, 2, 3, 4, 5]],
      [5, 5, [1, 2, 3, 4, 5]],
      [3, 6, [1, 2, 3, 4, 5]],
      [4, 6, [2, 3, 4, 5, 6]],
    ])("page %i of %i -> %j", (currentPage, numPages, expected) => {
      const { api } = setup(currentPage, numPages);
      expect(api().getPageRange()).toEqual(expected);
    });

    it("returns an empty range when there are no pages", () => {
      expect(setup(1, 0).api().getPageRange()).toEqual([]);
      expect(setup(0, 0).api().getPageRange()).toEqual([]);
    });

    it("throws a RangeError for a negative page count", () => {
      expect(() => setup(1, -1).api().getPageRange()).toThrow(RangeError);
    });

    it("clamps an out-of-range current page to the last window", () => {
      expect(setup(15, 10).api().getPageRange()).toEqual([6, 7, 8, 9, 10]);
    });
  });

  describe("getPageRange (custom numNeighbors)", () => {
    it.each<[number, number, number, number[]]>([
      [0, 1, 10, [1]],
      [0, 5, 10, [5]],
      [0, 10, 10, [10]],
      [1, 1, 10, [1, 2, 3]],
      [1, 2, 10, [1, 2, 3]],
      [1, 5, 10, [4, 5, 6]],
      [1, 9, 10, [8, 9, 10]],
      [1, 10, 10, [8, 9, 10]],
      [3, 1, 10, [1, 2, 3, 4, 5, 6, 7]],
      [3, 5, 10, [2, 3, 4, 5, 6, 7, 8]],
      [3, 10, 10, [4, 5, 6, 7, 8, 9, 10]],
      [3, 2, 4, [1, 2, 3, 4]],
    ])(
      "numNeighbors=%i, page %i of %i -> %j",
      (numNeighbors, currentPage, numPages, expected) => {
        const { api } = setup(currentPage, numPages, { numNeighbors });
        expect(api().getPageRange()).toEqual(expected);
      },
    );
  });
});
