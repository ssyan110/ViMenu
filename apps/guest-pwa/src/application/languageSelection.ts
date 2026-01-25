import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  getLanguageOrDefault,
} from "@/domain/language";

export type LanguageSelectionStorage = {
  get(key: string): string | null;
  set(key: string, value: string): void;
};

export function createRestaurantLanguageStorageKey(restaurantSlug: string) {
  return `vimenu_lang_${restaurantSlug}`;
}

export function getInitialSelectedLanguage(params: {
  restaurantSlug: string;
  queryLang?: string | null;
  storage?: LanguageSelectionStorage;
}): LanguageCode {
  const fromQuery = getLanguageOrDefault(params.queryLang);
  if (fromQuery !== DEFAULT_LANGUAGE) return fromQuery;

  const key = createRestaurantLanguageStorageKey(params.restaurantSlug);
  const fromStorage = params.storage?.get(key);
  return getLanguageOrDefault(fromStorage);
}

export function persistSelectedLanguage(params: {
  restaurantSlug: string;
  language: LanguageCode;
  storage: LanguageSelectionStorage;
}) {
  const key = createRestaurantLanguageStorageKey(params.restaurantSlug);
  params.storage.set(key, params.language);
}
