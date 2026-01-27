"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import type { LanguageCode } from "@/domain/language";
import type { MenuItem } from "@/domain/menu/models";
import { useMyItems } from "@/ui/hooks/useMyItems";
import { GuestMyItemsScreen } from "@/ui/screens/GuestMyItemsScreen";

type MyItemWithDetails = {
  itemId: string;
  quantity: number;
  item: MenuItem;
};

export function MyItemsPageClient(props: {
  restaurantSlug: string;
  selectedLanguage: LanguageCode;
  itemsById: Record<string, MenuItem>;
  currency: string;
}) {
  const router = useRouter();
  const myItems = useMyItems({ restaurantSlug: props.restaurantSlug });

  const itemsWithDetails: MyItemWithDetails[] = React.useMemo(() => {
    return myItems.items
      .map((myItem) => {
        const item = props.itemsById[myItem.itemId];
        if (!item) return null;
        return {
          itemId: myItem.itemId,
          quantity: myItem.quantity,
          item,
        };
      })
      .filter((x): x is MyItemWithDetails => x !== null);
  }, [myItems.items, props.itemsById]);

  const handleBack = React.useCallback(() => {
    router.push(`/r/${props.restaurantSlug}?lang=${props.selectedLanguage}`);
  }, [props.restaurantSlug, props.selectedLanguage, router]);

  const handleIncrease = React.useCallback(
    (itemId: string, currentQty: number) => {
      myItems.setQuantity(itemId, currentQty + 1);
    },
    [myItems],
  );

  const handleDecrease = React.useCallback(
    (itemId: string, currentQty: number) => {
      if (currentQty <= 1) {
        myItems.remove(itemId);
        return;
      }
      myItems.setQuantity(itemId, currentQty - 1);
    },
    [myItems],
  );

  const handleRemove = React.useCallback(
    (itemId: string) => {
      myItems.remove(itemId);
    },
    [myItems],
  );

  const handleClearAll = React.useCallback(() => {
    myItems.clear();
  }, [myItems]);

  return (
    <GuestMyItemsScreen
      restaurantSlug={props.restaurantSlug}
      items={itemsWithDetails}
      selectedLanguage={props.selectedLanguage}
      currency={props.currency}
      onBack={handleBack}
      onIncrease={handleIncrease}
      onDecrease={handleDecrease}
      onRemove={handleRemove}
      onClearAll={handleClearAll}
    />
  );
}

export default MyItemsPageClient;
