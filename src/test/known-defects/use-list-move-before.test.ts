import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListItem, useList } from "../../lib/draggable-list/useList";

const items: ListItem[] = [1, 2, 3, 4].map((id) => ({
  id,
  name: `Item ${id}`,
  value: "",
}));

describe("useList.moveBefore", () => {
  // Tracked by 2026-10-09-ui-components-library-uselist-downward-movebefore; drop `.fails` when fixed.
  it.fails("places a downward move directly before the target", () => {
    const { result } = renderHook(() => useList({ initialItems: items }));

    act(() => result.current.moveBefore(3, [1]));

    expect(result.current.items.map((item) => item.id)).toEqual([2, 1, 3, 4]);
  });
});
