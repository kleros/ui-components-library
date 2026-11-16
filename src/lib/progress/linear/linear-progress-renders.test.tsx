import React, { Profiler } from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { installResizeObserverMock } from "../../../test/resize-observer-mock";
import LinearProgress from "./index";

// A fixed-width bar (the 3.10 usage) should not re-render when the window resizes: its width never comes from
// the measured size.
describe("LinearProgress render count", () => {
  beforeEach(() => {
    installResizeObserverMock();
  });

  it("commits once on mount and never on a window resize when the width is fixed", () => {
    let commits = 0;
    render(
      <Profiler id="bar" onRender={() => commits++}>
        <LinearProgress value={40} width={200} />
      </Profiler>,
    );
    expect(commits).toBe(1);

    for (let i = 0; i < 5; i++) {
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });
    }
    expect(commits).toBe(1);
  });
});
