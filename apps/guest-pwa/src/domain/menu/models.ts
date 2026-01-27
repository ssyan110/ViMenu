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
  price?: number;
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
    // Resolved label for current language (fallbacks to Vietnamese).
    display: string;
    // Always keep Vietnamese for bilingual fallback.
    displayVi: string;
    icon?: string;
  }>;
  dietaryTags?: MenuDietaryTagCode[];
};

export type MenuAllergenFilterOption = {
  code: MenuAllergenCode;
  // Resolved label for current language (fallbacks to Vietnamese).
  label: string;
  // Always keep Vietnamese for bilingual fallback.
  labelVi: string;
  icon?: string;
};

export type MenuDietaryFilterOption = {
  code: MenuDietaryTagCode;
  // Resolved label for current language (fallbacks to Vietnamese).
  label: string;
  // Always keep Vietnamese for bilingual fallback.
  labelVi: string;
};

export type GuestMenuCategory = {
  id: string;
  nameVi: string;
  nameByLang?: Record<string, string | undefined>;
  sortOrder: number;
  items: MenuItem[];
};

export type GuestMenu = {
  lang: string;
  currency: string;
  categories: GuestMenuCategory[];
  availableAllergens?: MenuAllergenFilterOption[];
  availableDietaryTags?: MenuDietaryFilterOption[];
};

export type GuestItemDetail = {
  lang: string;
  currency: string;
  restaurant: {
    slug: string;
    name: string;
  };
  category?: {
    id: string;
    nameVi: string;
    nameByLang?: Record<string, string | undefined>;
  };
  item: MenuItem & {
    nutrition?: {
      calories?: number;
      proteinG?: number;
      fatG?: number;
      carbsG?: number;
      sodiumMg?: number;
    };
    dietaryTagsWithLabels?: Array<{
      code: MenuDietaryTagCode;
      label: string;
      labelVi: string;
    }>;
  };
};
