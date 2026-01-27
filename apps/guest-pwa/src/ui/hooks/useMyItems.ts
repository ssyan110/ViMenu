"use client";

import * as React from "react";

import {
  getMyItemsStorageKey,
  migrateOldMyItemsState,
  type MyItemsState,
} from "@/application/myItemsStorage";

function readState(storageKey: string): MyItemsState {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    return migrateOldMyItemsState(parsed);
  } catch {
    return { items: [] };
  }
}

export function useMyItems(params: { restaurantSlug: string }) {
  const storageKey = React.useMemo(
    () => getMyItemsStorageKey(params.restaurantSlug),
    [params.restaurantSlug],
  );

  const [state, setState] = React.useState<MyItemsState>({ items: [] });

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
    (itemId: string, quantity = 1) => {
      const existing = state.items.find((it) => it.itemId === itemId);
      if (existing) {
        const next = {
          items: state.items.map((it) =>
            it.itemId === itemId
              ? { ...it, quantity: it.quantity + quantity }
              : it,
          ),
        };
        persist(next);
      } else {
        const next = {
          items: [...state.items, { itemId, quantity }],
        };
        persist(next);
      }
    },
    [persist, state.items],
  );

  const remove = React.useCallback(
    (itemId: string) => {
      const next = {
        items: state.items.filter((it) => it.itemId !== itemId),
      };
      persist(next);
    },
    [persist, state.items],
  );

  const setQuantity = React.useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        remove(itemId);
        return;
      }
      const next = {
        items: state.items.map((it) =>
          it.itemId === itemId ? { ...it, quantity } : it,
        ),
      };
      persist(next);
    },
    [persist, remove, state.items],
  );

  const clear = React.useCallback(() => persist({ items: [] }), [persist]);

  const itemIds = React.useMemo(
    () => state.items.map((it) => it.itemId),
    [state.items],
  );

  return {
    items: state.items,
    itemIds,
    count: state.items.length,
    totalQuantity: state.items.reduce((sum, it) => sum + it.quantity, 0),
    add,
    remove,
    setQuantity,
    clear,
  };
}
