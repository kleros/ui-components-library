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

// Both tests start from zero and leave hooks mounted, so without cleanup
// whichever runs second fails.
describe("test isolation", () => {
  it.each(["a", "b"])(
    "starts with no hooks mounted and leaves two mounted (%s)",
    () => {
      expect(mounted).toBe(0);
      renderHook(() => useMountCounter());
      renderHook(() => useMountCounter());
      expect(mounted).toBe(2);
    },
  );
});
