"use client";

import * as React from "react";

import {
  getMyItemsStorageKey,
  type MyItemsState,
} from "@/application/myItemsStorage";

function readState(storageKey: string): MyItemsState {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { itemIds: [] };
    const parsed = JSON.parse(raw) as Partial<MyItemsState>;
    return { itemIds: Array.isArray(parsed.itemIds) ? parsed.itemIds : [] };
  } catch {
    return { itemIds: [] };
  }
}

export function useMyItems(params: { restaurantSlug: string }) {
  const storageKey = React.useMemo(
    () => getMyItemsStorageKey(params.restaurantSlug),
    [params.restaurantSlug],
  );

  const [state, setState] = React.useState<MyItemsState>({ itemIds: [] });

  React.useEffect(() => {
    setState(readState(storageKey));
  }, [storageKey]);

  const persist = React.useCallback(
    (next: MyItemsState) => {
      setState(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [storageKey],
  );

  const add = React.useCallback(
    (itemId: string) => {
      const next = {
        itemIds: Array.from(new Set([...state.itemIds, itemId])),
      };
      persist(next);
    },
    [persist, state.itemIds],
  );

  const remove = React.useCallback(
    (itemId: string) => {
      const next = {
        itemIds: state.itemIds.filter((id) => id !== itemId),
      };
      persist(next);
    },
    [persist, state.itemIds],
  );

  const clear = React.useCallback(() => persist({ itemIds: [] }), [persist]);

  return {
    itemIds: state.itemIds,
    count: state.itemIds.length,
    add,
    remove,
    clear,
  };
}
