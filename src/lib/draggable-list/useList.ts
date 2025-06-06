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

  // track updates to initialItems
  useEffect(() => {
    setItems((prevItems) => {
      // preventing callback loop
      if (_.isEqual(initialItems, prevItems)) return prevItems;
      return initialItems;
    });
  }, [initialItems]);

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
      // updateItems(items.filter((item) => key !== item.id));
      setItems((prevItems) => {
        const newItems = prevItems.filter((item) => key !== item.id);
        onChange?.(newItems);
        return newItems;
      });
    },
    [onChange],
  );

  const moveBefore = useCallback(
    (targetKey: Key, keys: Iterable<Key>) => {
      setItems((prevItems) => {
        const key = Array.from(keys)[0];
        if (key === targetKey) return prevItems;

        const indexFrom = prevItems.findIndex((item) => item.id === key);
        const indexTo = prevItems.findIndex((item) => item.id === targetKey);
        if (indexFrom === -1 || indexTo === -1) return prevItems;

        const reordered = [...prevItems];
        const [movedItem] = reordered.splice(indexFrom, 1);
        reordered.splice(indexTo, 0, movedItem);
        onChange?.(reordered);

        return reordered;
      });
    },
    [onChange],
  );

  const moveAfter = useCallback(
    (targetKey: Key, keys: Iterable<Key>) => {
      setItems((prevItems) => {
        const key = Array.from(keys)[0];
        if (key === targetKey) return prevItems;

        const indexFrom = prevItems.findIndex((item) => item.id === key);
        const indexTo = prevItems.findIndex((item) => item.id === targetKey);
        if (indexFrom === -1 || indexTo === -1) return prevItems;

        const reordered = [...prevItems];
        const [movedItem] = reordered.splice(indexFrom, 1);

        // Adjust if removing item before target index
        const insertIndex = indexFrom < indexTo ? indexTo : indexTo + 1;
        reordered.splice(insertIndex, 0, movedItem);
        onChange?.(reordered);

        return reordered;
      });
    },
    [onChange],
  );

  return {
    items,
    getItem,
    remove,
    moveBefore,
    moveAfter,
  };
}
