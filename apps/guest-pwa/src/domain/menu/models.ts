export type MenuCategory = {
  id: string;
  name: string;
  itemCount?: number;
};

export type MenuDietaryTagCode =
  | "halal"
  | "kosher"
  | "vegetarian"
  | "vegan"
  | "gluten_free";

export type MenuAllergenCode =
  | "peanut"
  | "shrimp"
  | "egg"
  | "gluten"
  | "soy"
  | "fish"
  | "milk";

export type MenuItemBadge =
  | { type: "dietary"; code: MenuDietaryTagCode }
  | { type: "label"; code: "popular" | "best_seller" };

export type MenuItem = {
  id: string;
  categoryId: string;
  sku?: string;
  priceText?: string;
  priceNote?: string;
  imageUrl?: string;
  nameVi: string;
  nameByLang?: Record<string, string | undefined>;
  descriptionVi?: string;
  descriptionByLang?: Record<string, string | undefined>;
  badges?: Array<{ code: string; rank?: number }>;
  allergens?: Array<{
    code: MenuAllergenCode;
    displayVi: string;
    icon?: string;
  }>;
  dietaryTags?: MenuDietaryTagCode[];
};

export type GuestMenuCategory = {
  id: string;
  nameVi: string;
  sortOrder: number;
  items: MenuItem[];
};

export type GuestMenu = {
  lang: string;
  currency: string;
  categories: GuestMenuCategory[];
};
