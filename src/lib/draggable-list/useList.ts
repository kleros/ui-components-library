import { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";

type Key = string | number;

export interface ListItem {
  id: Key;
  name: string;
  value: any;
}

interface UseListOptions {
  initialItems: ListItem[];
  onChange?: (updatedItems: ListItem[]) => void;
}

export function useList({ initialItems, onChange }: UseListOptions) {
  const [items, setItems] = useState<ListItem[]>(initialItems);

  useEffect(() => {
    // preventing callback loop, we cannot rely on useEffect dependency since that does not utilize deep comparison
    if (_.isEqual(initialItems, items)) return;

    setItems(initialItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialItems]);

  const updateItems = useCallback(
    (newItems: ListItem[]) => {
      setItems(newItems);
      onChange?.(newItems);
    },
    [onChange],
  );

  const itemsMap = useMemo(() => {
    const map = new Map<Key, ListItem>();
    for (const item of items) {
      map.set(item.id, item);
    }
    return map;
  }, [items]);

  const getItem = useCallback((key: Key) => itemsMap.get(key), [itemsMap]);

  const remove = useCallback(
    (key: Key) => {
      updateItems(items.filter((item) => key !== item.id));
    },
    [items, updateItems],
  );

  const moveBefore = useCallback(
    (targetKey: Key, keys: Iterable<Key>) => {
      const key = Array.from(keys)[0];
      if (key === targetKey) return;

      const indexFrom = items.findIndex((item) => item.id === key);
      const indexTo = items.findIndex((item) => item.id === targetKey);
      if (indexFrom === -1 || indexTo === -1) return;

      const reordered = [...items];
      const [movedItem] = reordered.splice(indexFrom, 1);
      reordered.splice(indexTo, 0, movedItem);
      updateItems(reordered);
    },
    [items, updateItems],
  );

  const moveAfter = useCallback(
    (targetKey: Key, keys: Iterable<Key>) => {
      const key = Array.from(keys)[0];
      if (key === targetKey) return;

      const indexFrom = items.findIndex((item) => item.id === key);
      const indexTo = items.findIndex((item) => item.id === targetKey);
      if (indexFrom === -1 || indexTo === -1) return;

      const reordered = [...items];
      const [movedItem] = reordered.splice(indexFrom, 1);

      // Adjust if removing item before target index
      const insertIndex = indexFrom < indexTo ? indexTo : indexTo + 1;
      reordered.splice(insertIndex, 0, movedItem);
      updateItems(reordered);
    },
    [items, updateItems],
  );

  return {
    items,
    getItem,
    remove,
    moveBefore,
    moveAfter,
  };
}
