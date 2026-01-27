"use client";

import * as React from "react";

import {
  getInitialSelectedLanguage,
  persistSelectedLanguage,
  type LanguageSelectionStorage,
} from "@/application/languageSelection";
import {
  DEFAULT_LANGUAGE,
  getLanguageOrDefault,
  type LanguageCode,
} from "@/domain/language";

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

  // IMPORTANT: avoid reading localStorage during the initial render.
  // Client Components are still server-rendered, so storage-driven state here
  // can cause hydration mismatches.
  const [selected, setSelected] = React.useState<LanguageCode>(() =>
    getLanguageOrDefault(params.queryLang),
  );

  // After mount, sync from localStorage (unless URL already pins language).
  React.useEffect(() => {
    const next = getInitialSelectedLanguage({
      restaurantSlug: params.restaurantSlug,
      queryLang: params.queryLang,
      storage,
    });
    setSelected((prev) => (prev === next ? prev : next));
  }, [params.queryLang, params.restaurantSlug, storage]);

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
