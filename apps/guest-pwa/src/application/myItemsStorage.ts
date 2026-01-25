export type MyItemsState = {
  itemIds: string[];
};

export function getMyItemsStorageKey(restaurantSlug: string) {
  return `vimenu_my_items_${restaurantSlug}`;
}
