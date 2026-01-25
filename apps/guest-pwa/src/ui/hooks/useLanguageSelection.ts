"use client";

import * as React from "react";

import {
  getInitialSelectedLanguage,
  persistSelectedLanguage,
  type LanguageSelectionStorage,
} from "@/application/languageSelection";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/domain/language";

function createBrowserStorage(): LanguageSelectionStorage {
  return {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    },
  };
}

export function useLanguageSelection(params: {
  restaurantSlug: string;
  queryLang?: string | null;
}) {
  const storage = React.useMemo(() => createBrowserStorage(), []);

  const [selected, setSelected] = React.useState<LanguageCode>(() =>
    getInitialSelectedLanguage({
      restaurantSlug: params.restaurantSlug,
      queryLang: params.queryLang,
      storage,
    }),
  );

  const isDefault = selected === DEFAULT_LANGUAGE;

  const select = React.useCallback((code: LanguageCode) => {
    setSelected(code);
  }, []);

  const persist = React.useCallback(() => {
    persistSelectedLanguage({
      restaurantSlug: params.restaurantSlug,
      language: selected,
      storage,
    });
  }, [params.restaurantSlug, selected, storage]);

  return { selected, isDefault, select, persist };
}
