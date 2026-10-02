import { renderHook } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it } from "vitest";

// Regression test for src/test/setup.ts: hooks rendered in one test must be
// unmounted (effects cleaned up) before the next test starts.
let mounted = 0;
const useMountCounter = () => {
  useEffect(() => {
    mounted += 1;
    return () => {
      mounted -= 1;
    };
  }, []);
};

describe("test isolation", () => {
  it("mounts a hook and leaves it mounted at the end of the test", () => {
    renderHook(() => useMountCounter());
    renderHook(() => useMountCounter());
    expect(mounted).toBe(2);
  });

  it("starts the next test with every previous hook unmounted", () => {
    expect(mounted).toBe(0);
  });
});
