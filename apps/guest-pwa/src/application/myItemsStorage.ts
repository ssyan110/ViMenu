export type MyItemsState = {
  items: Array<{ itemId: string; quantity: number }>;
};

export function getMyItemsStorageKey(restaurantSlug: string) {
  return `vimenu_my_items_${restaurantSlug}`;
}
export function migrateOldMyItemsState(old: any): MyItemsState {
  // Migrate old { itemIds: string[] } to new format
  if (Array.isArray(old?.itemIds)) {
    return {
      items: old.itemIds.map((id: string) => ({ itemId: id, quantity: 1 })),
    };
  }
  if (Array.isArray(old?.items)) {
    return { items: old.items };
  }
  return { items: [] };
}
