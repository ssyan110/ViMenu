export type MyItemsState = {
  items: Array<{ itemId: string; quantity: number }>;
};

export function getMyItemsStorageKey(restaurantSlug: string) {
  return `vimenu_my_items_${restaurantSlug}`;
}

type LegacyMyItemsStateV1 = {
  itemIds?: unknown;
  items?: unknown;
};

function asLegacyState(value: unknown): LegacyMyItemsStateV1 {
  if (value && typeof value === "object") return value as LegacyMyItemsStateV1;
  return {};
}

function isItemEntry(
  value: unknown,
): value is { itemId: string; quantity: number } {
  if (!value || typeof value !== "object") return false;
  const v = value as { itemId?: unknown; quantity?: unknown };
  return typeof v.itemId === "string" && typeof v.quantity === "number";
}

export function migrateOldMyItemsState(old: unknown): MyItemsState {
  // Migrate old { itemIds: string[] } to new format
  const legacy = asLegacyState(old);

  if (Array.isArray(legacy.itemIds)) {
    return {
      items: legacy.itemIds
        .filter((id): id is string => typeof id === "string" && id.length > 0)
        .map((id) => ({ itemId: id, quantity: 1 })),
    };
  }

  if (Array.isArray(legacy.items)) {
    const items = legacy.items.filter(isItemEntry).map((it) => ({
      itemId: it.itemId,
      quantity: Number.isFinite(it.quantity)
        ? Math.max(1, Math.floor(it.quantity))
        : 1,
    }));
    return { items };
  }
  return { items: [] };
}
