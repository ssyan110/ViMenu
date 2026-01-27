export type MenuCategory = {
  id: string;
  name: string;
  itemCount?: number;
};

// Dietary tag codes come from backend master data.
export type MenuDietaryTagCode = string;

// NOTE: Allergen codes come from backend master data. Do not whitelist/filter
// in the frontend, otherwise newly added codes will disappear from UI.
export type MenuAllergenCode = string;

// Badges come from backend; keep them generic to avoid dropping new codes.
export type MenuItemBadge = {
  code: string;
  rank?: number;
};

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
  badges?: MenuItemBadge[];
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
