"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { getBilingualName } from "@/application/bilingualMenuText";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  normalizeLanguageCode,
} from "@/domain/language";
import type { GuestMenu, MenuItem } from "@/domain/menu/models";
import { cn } from "@/shared/cn";
import { AllergenBadge } from "@/ui/components/AllergenBadge";
import { FilterSheet, type MenuFilters } from "@/ui/components/FilterSheet";
import { LanguageSwitcherSheet } from "@/ui/components/LanguageSwitcherSheet";
import { useLanguageSelection } from "@/ui/hooks/useLanguageSelection";
import { useMyItems } from "@/ui/hooks/useMyItems";
import { useRestaurantWeatherToday } from "@/ui/hooks/useRestaurantWeatherToday";
import {
  IconArrowRight,
  IconClose,
  IconCloud,
  IconCloudRain,
  IconCloudSun,
  IconFilter,
  IconInfo,
  IconPlus,
  IconShoppingBag,
  IconSun,
  IconThermometer,
} from "@/ui/icons";

function useIsHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}

function MenuItemCard(props: {
  item: MenuItem;
  bilingual: { primary: string; secondary?: string };
  selectedLanguage: LanguageCode;
  onAdd: () => void;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [props.item.imageUrl]);

  const showImage = Boolean(props.item.imageUrl) && !imageFailed;

  const description =
    props.item.descriptionByLang?.[
      normalizeLanguageCode(props.selectedLanguage)
    ] ?? props.item.descriptionVi;

  if (showImage) {
    const hasPopularBadge = (props.item.badges ?? []).some((b) =>
      ["popular", "best_seller"].includes(String(b.code).toLowerCase()),
    );

    return (
      <article className="glass-card rounded-2xl p-3 flex gap-4 shadow-lg group relative overflow-hidden">
        <div className="w-28 shrink-0 relative rounded-xl overflow-hidden aspect-square bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={props.item.imageUrl}
            alt={props.bilingual.primary}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />

          {hasPopularBadge ? (
            <div className="absolute top-0 left-0 bg-primary/90 text-background-dark text-[10px] font-bold px-2 py-1 rounded-br-lg backdrop-blur-sm">
              POPULAR
            </div>
          ) : null}
        </div>

        <div className="flex flex-col flex-1 justify-between py-1 min-w-0">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-white text-lg font-bold leading-tight truncate">
                {props.bilingual.primary}
              </h3>
              {props.item.priceText ? (
                <span className="text-primary font-bold text-base whitespace-nowrap">
                  {props.item.priceText}
                </span>
              ) : null}
            </div>
            {props.bilingual.secondary ? (
              <p className="text-white/50 text-sm italic font-medium mt-0.5 truncate">
                {props.bilingual.secondary}
              </p>
            ) : null}
          </div>

          <div className="flex items-end justify-between mt-3">
            <div className="flex gap-2">
              {(props.item.allergens ?? []).slice(0, 2).map((a) => (
                <AllergenBadge
                  key={`${props.item.id}-alg-${a.code}`}
                  code={a.code}
                  icon={a.icon}
                  title={a.display}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={props.onAdd}
              className="size-8 rounded-full bg-primary text-background-dark flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
              aria-label="Add to My Items"
            >
              <IconPlus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="glass-card rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group active:bg-white/5 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-white text-lg font-bold leading-tight min-w-0 truncate">
          {props.bilingual.primary}
        </h3>
        {props.item.priceText ? (
          <span className="text-primary font-bold text-lg whitespace-nowrap">
            {props.item.priceText}
          </span>
        ) : null}
      </div>

      {props.bilingual.secondary ? (
        <p className="text-white/50 text-sm font-medium italic -mt-2 truncate">
          {props.bilingual.secondary}
        </p>
      ) : null}

      {description ? (
        <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4 mt-1">
        <div className="flex flex-wrap gap-2">
          {(props.item.allergens ?? []).slice(0, 3).map((a) => (
            <AllergenBadge
              key={`${props.item.id}-alg-${a.code}`}
              code={a.code}
              icon={a.icon}
              title={a.display}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={props.onAdd}
          className="size-9 rounded-full bg-primary text-background-dark flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer shrink-0"
          aria-label="Add to My Items"
        >
          <IconPlus className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

function useMenuFilters(params: {
  hydrated: boolean;
  initialDiet?: string;
  initialExcl?: string;
}) {
  const sp = useSearchParams();

  const normalizeBackendCode = React.useCallback((code: string) => {
    const c = code.trim().toLowerCase();
    return c.length ? c : null;
  }, []);

  const initial = React.useMemo<MenuFilters>(() => {
    const dietRaw = params.hydrated
      ? (sp.get("diet") ?? "")
      : (params.initialDiet ?? "");
    const exclRaw = params.hydrated
      ? (sp.get("excl") ?? "")
      : (params.initialExcl ?? "");

    const dietary = dietRaw.split(",").flatMap((s) => {
      const v = normalizeBackendCode(s);
      return v ? [v] : [];
    });

    const excludeAllergens = exclRaw.split(",").flatMap((s) => {
      const v = normalizeBackendCode(s);
      return v ? [v] : [];
    });

    return { dietary, excludeAllergens };
  }, [
    normalizeBackendCode,
    params.hydrated,
    params.initialDiet,
    params.initialExcl,
    sp,
  ]);

  const [value, setValueState] = React.useState<MenuFilters>(initial);

  // If the user lands on a shared URL with filters, initialize from it.
  React.useEffect(() => {
    setValueState(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.dietary.join(","), initial.excludeAllergens.join(",")]);

  const setValue = React.useCallback((next: MenuFilters) => {
    setValueState(next);

    // Update URL for shareability without triggering App Router navigation.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);

      if (next.dietary.length)
        url.searchParams.set("diet", next.dietary.join(","));
      else url.searchParams.delete("diet");

      if (next.excludeAllergens.length)
        url.searchParams.set("excl", next.excludeAllergens.join(","));
      else url.searchParams.delete("excl");

      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  return { value, setValue };
}

function matchesFilters(item: MenuItem, filters: MenuFilters) {
  const itemAllergens = new Set(
    (item.allergens ?? []).map((a) => String(a.code).trim().toLowerCase()),
  );

  // Dietary tags are plan-gated + admin-confirmed; if the API doesn't provide them yet,
  // we keep the UI but don't hide everything.
  if (filters.dietary.length && (item.dietaryTags?.length ?? 0) > 0) {
    const itemDietary = new Set(
      (item.dietaryTags ?? []).map((t) => String(t).trim().toLowerCase()),
    );
    for (const requiredRaw of filters.dietary) {
      const required = String(requiredRaw).trim().toLowerCase();
      if (!itemDietary.has(required)) return false;
    }
  }

  for (const excl of filters.excludeAllergens) {
    if (itemAllergens.has(excl)) return false;
  }

  return true;
}

export function GuestMenuScreen(props: {
  initialSearchParams?: {
    lang?: string;
    cat?: string;
    diet?: string;
    excl?: string;
  };
  restaurant: {
    slug: string;
    name: string;
    locationText?: string;
    logoUrl?: string;
  };
  availableLanguages: LanguageCode[];
  menu: GuestMenu;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useIsHydrated();
  const queryLang = hydrated
    ? searchParams.get("lang")
    : (props.initialSearchParams?.lang ?? null);
  const [, startCategoryTransition] = React.useTransition();

  const availableLanguages = React.useMemo(() => {
    const normalized = props.availableLanguages.map((l) =>
      normalizeLanguageCode(l),
    );
    return Array.from(new Set([DEFAULT_LANGUAGE, ...normalized]));
  }, [props.availableLanguages]);

  const { selected, select, persist } = useLanguageSelection({
    restaurantSlug: props.restaurant.slug,
    queryLang,
  });

  // Ensure URL always contains lang so server fetch matches the persisted selection.
  React.useEffect(() => {
    if (queryLang) return;
    if (!selected) return;
    if (selected === DEFAULT_LANGUAGE) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("lang", selected);
    router.replace(`/r/${props.restaurant.slug}?${next.toString()}`);
  }, [props.restaurant.slug, queryLang, router, searchParams, selected]);

  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const weather = useRestaurantWeatherToday({
    restaurantSlug: props.restaurant.slug,
    locationText: props.restaurant.locationText,
    language: normalizeLanguageCode(selected),
  });

  const categories = React.useMemo(
    () => props.menu.categories,
    [props.menu.categories],
  );
  const allItems = React.useMemo(
    () => categories.flatMap((c) => c.items),
    [categories],
  );

  const [activeCategoryId, setActiveCategoryId] = React.useState<
    string | undefined
  >(() => props.initialSearchParams?.cat ?? categories[0]?.id);

  React.useEffect(() => {
    if (!categories.length) return;
    if (
      !activeCategoryId ||
      !categories.some((c) => c.id === activeCategoryId)
    ) {
      setActiveCategoryId(categories[0]?.id);
    }
  }, [activeCategoryId, categories]);

  const myItems = useMyItems({ restaurantSlug: props.restaurant.slug });
  const filters = useMenuFilters({
    hydrated,
    initialDiet: props.initialSearchParams?.diet,
    initialExcl: props.initialSearchParams?.excl,
  });

  const activeCategory = activeCategoryId;

  const hasActiveFilters =
    filters.value.dietary.length > 0 ||
    filters.value.excludeAllergens.length > 0;

  const dietaryLabelByCode = React.useMemo(() => {
    const map = new Map<string, { label: string; labelVi: string }>();
    for (const t of props.menu.availableDietaryTags ?? []) {
      map.set(String(t.code).trim().toLowerCase(), {
        label: t.label,
        labelVi: t.labelVi,
      });
    }
    return map;
  }, [props.menu.availableDietaryTags]);

  const allergenLabelByCode = React.useMemo(() => {
    const map = new Map<string, { label: string; labelVi: string }>();
    for (const a of props.menu.availableAllergens ?? []) {
      map.set(String(a.code).trim().toLowerCase(), {
        label: a.label,
        labelVi: a.labelVi,
      });
    }
    return map;
  }, [props.menu.availableAllergens]);

  const activeFilterChips = React.useMemo(() => {
    const chips: Array<
      | { kind: "dietary"; code: string; text: string }
      | { kind: "allergen"; code: string; text: string }
    > = [];

    for (const rawCode of filters.value.dietary) {
      const code = String(rawCode).trim().toLowerCase();
      if (!code) continue;
      const resolved = dietaryLabelByCode.get(code);
      const label = (resolved?.label ?? code).toUpperCase();
      chips.push({ kind: "dietary", code, text: label });
    }

    for (const rawCode of filters.value.excludeAllergens) {
      const code = String(rawCode).trim().toLowerCase();
      if (!code) continue;
      const resolved = allergenLabelByCode.get(code);
      const label = (resolved?.label ?? code).toUpperCase();
      const prefix = selected === DEFAULT_LANGUAGE ? "KHÔNG " : "NO ";
      chips.push({ kind: "allergen", code, text: `${prefix}${label}` });
    }

    return chips;
  }, [
    allergenLabelByCode,
    dietaryLabelByCode,
    filters.value.dietary,
    filters.value.excludeAllergens,
    selected,
  ]);

  const filterSummary = React.useMemo(() => {
    if (!hasActiveFilters) return null;

    const dietaryPrimary = filters.value.dietary
      .map((raw) => {
        const code = String(raw).trim().toLowerCase();
        const resolved = dietaryLabelByCode.get(code);
        return (resolved?.label ?? code).trim();
      })
      .filter(Boolean);

    const dietaryVi = filters.value.dietary
      .map((raw) => {
        const code = String(raw).trim().toLowerCase();
        const resolved = dietaryLabelByCode.get(code);
        return (resolved?.labelVi ?? code).trim();
      })
      .filter(Boolean);

    const exclPrimary = filters.value.excludeAllergens
      .map((raw) => {
        const code = String(raw).trim().toLowerCase();
        const resolved = allergenLabelByCode.get(code);
        const label = (resolved?.label ?? code).trim();
        return label ? `${label}-free` : "";
      })
      .filter(Boolean);

    const exclVi = filters.value.excludeAllergens
      .map((raw) => {
        const code = String(raw).trim().toLowerCase();
        const resolved = allergenLabelByCode.get(code);
        const label = (resolved?.labelVi ?? code).trim();
        return label ? `không ${label}` : "";
      })
      .filter(Boolean);

    const join = (parts: string[]) => {
      const uniq = Array.from(new Set(parts));
      return uniq.join(" & ");
    };

    const primaryParts = [...dietaryPrimary, ...exclPrimary].filter(Boolean);
    const viParts = [...dietaryVi, ...exclVi].filter(Boolean);

    return {
      primary: join(primaryParts),
      vi: join(viParts),
    };
  }, [
    allergenLabelByCode,
    dietaryLabelByCode,
    filters.value.dietary,
    filters.value.excludeAllergens,
    hasActiveFilters,
  ]);

  const totalItemsInActiveCategory = React.useMemo(() => {
    if (!activeCategory) return 0;
    return allItems.filter((it) => it.categoryId === activeCategory).length;
  }, [activeCategory, allItems]);

  const visibleItems = React.useMemo(() => {
    return allItems
      .filter((it) => it.categoryId === activeCategory)
      .filter((it) => matchesFilters(it, filters.value));
  }, [activeCategory, allItems, filters.value]);

  const onSelectLanguage = React.useCallback(
    (code: LanguageCode) => {
      select(code);
      persist();
      const current =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams(searchParams.toString());
      current.set("lang", code);
      router.replace(`/r/${props.restaurant.slug}?${current.toString()}`);
      setLanguageOpen(false);
    },
    [persist, props.restaurant.slug, router, searchParams, select],
  );

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-[max(884px,100dvh)] font-display text-white selection:bg-primary selection:text-white pb-24">
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-full ring-2 ring-white/10">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${props.restaurant.logoUrl ?? "https://lh3.googleusercontent.com/aida-public/AB6AXuAj2RNja1FyNclf5I3NTx-4MuYV1rVHCq49rmUV6FgyJHhtBu9iqv7GBqShe1t2hmh5Lan737o79Nar8MkRmNfjv67Vyaf7scg3TFQeD5DlQGUd45eE0kfZBpqrtqsoDxVc-2gNYSXehOTNgy-kBEoO_vNdQBH7Tj7tbrKa34MxbfMRWNBSvbyFqS0EGsPiWAYYL_MIaRl-_IaIqu7tvA8EprP_C8d_IjbCpYg6xnDX34OG1ZSTq82Dox0NX1MDsVDcR0DjqYhMnkZo"})`,
                }}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white/90 truncate">
                {props.restaurant.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-primary">
                {(() => {
                  const code = weather.data?.weatherCode;
                  if (code == null)
                    return <IconThermometer className="h-4 w-4" />;
                  // Open-Meteo weather codes (very small mapping for UI).
                  // 0: clear, 1-3: partly/cloudy, 51-67: drizzle/rain, 80-82: rain showers.
                  if (code === 0) return <IconSun className="h-4 w-4" />;
                  if (code >= 1 && code <= 3)
                    return <IconCloudSun className="h-4 w-4" />;
                  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
                    return <IconCloudRain className="h-4 w-4" />;
                  return <IconCloud className="h-4 w-4" />;
                })()}
                <span className="opacity-90 truncate">
                  {weather.data
                    ? `${Math.round(weather.data.temperatureC)}°C today`
                    : weather.status === "loading"
                      ? "Loading weather…"
                      : weather.status === "error"
                        ? "Weather unavailable"
                        : "Weather"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className="flex size-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white border border-white/10 cursor-pointer"
              aria-label="Change language"
            >
              <span className="text-[11px] font-bold tracking-tight text-primary">
                {selected.toUpperCase()}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="flex size-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white border border-white/10 cursor-pointer"
              aria-label="Open filters"
            >
              <IconFilter className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar pb-3 pt-1 px-5 flex gap-3 snap-x">
          {categories.map((c) => {
            const isActive = c.id === activeCategory;
            const catText = getBilingualName({
              nameVi: c.nameVi,
              nameByLang: c.nameByLang,
              selectedLanguage: selected,
            }).primary;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  startCategoryTransition(() => {
                    setActiveCategoryId(c.id);

                    // Keep category in URL for shareability without triggering
                    // App Router navigation (which would refetch server data).
                    if (typeof window !== "undefined") {
                      const url = new URL(window.location.href);
                      url.searchParams.set("cat", c.id);
                      window.history.replaceState(null, "", url.toString());
                    }
                  });
                }}
                className={cn(
                  "snap-start shrink-0 h-9 px-5 rounded-full text-sm border transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-primary text-background-dark font-bold shadow-[0_0_15px_rgba(19,182,236,0.3)] border-transparent"
                    : "bg-white/5 hover:bg-white/10 text-white/80 font-medium border-white/10 backdrop-blur-sm",
                )}
              >
                {catText}
              </button>
            );
          })}
        </div>

        {hasActiveFilters ? (
          <div className="px-5 pb-3 -mt-1">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {activeFilterChips.map((c) => (
                <button
                  key={`${c.kind}:${c.code}`}
                  type="button"
                  onClick={() => {
                    if (c.kind === "dietary") {
                      filters.setValue({
                        ...filters.value,
                        dietary: filters.value.dietary.filter(
                          (x) => String(x).trim().toLowerCase() !== c.code,
                        ),
                      });
                      return;
                    }
                    filters.setValue({
                      ...filters.value,
                      excludeAllergens: filters.value.excludeAllergens.filter(
                        (x) => String(x).trim().toLowerCase() !== c.code,
                      ),
                    });
                  }}
                  className={cn(
                    "flex items-center gap-2 h-9 px-4 rounded-full border text-xs font-extrabold tracking-wider whitespace-nowrap",
                    "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15",
                  )}
                  aria-label={`Remove filter ${c.text}`}
                >
                  <span className="truncate">{c.text}</span>
                  <IconClose className="h-4 w-4 opacity-80" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main className="px-4 pt-6 flex flex-col gap-5">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-xl font-bold text-white">
            {(() => {
              const c = categories.find((x) => x.id === activeCategory);
              if (!c) return "Menu";
              return getBilingualName({
                nameVi: c.nameVi,
                nameByLang: c.nameByLang,
                selectedLanguage: selected,
              }).primary;
            })()}
          </h2>
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
            {hasActiveFilters
              ? `FILTERED: ${visibleItems.length} ITEMS`
              : `${totalItemsInActiveCategory} ITEMS`}
          </span>
        </div>

        {filterSummary ? (
          <div className="px-1">
            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 flex gap-3 items-start">
              <div className="mt-0.5 text-primary">
                <IconInfo className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white/70">
                  Showing:{" "}
                  <span className="text-white font-bold">
                    {filterSummary.primary}
                  </span>{" "}
                  items
                </p>
                <p className="text-[11px] text-white/40 font-semibold italic truncate">
                  Đang hiển thị: {filterSummary.vi} items
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div key={activeCategory ?? "category"} className="menu-list-animate">
          <div className="flex flex-col gap-5">
            {visibleItems.map((item) => {
              const bilingual = getBilingualName({
                nameVi: item.nameVi,
                nameByLang: item.nameByLang,
                selectedLanguage: selected,
                fallbackSecondaryLanguage: availableLanguages.includes("en")
                  ? "en"
                  : DEFAULT_LANGUAGE,
              });

              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  bilingual={bilingual}
                  selectedLanguage={selected}
                  onAdd={() => myItems.add(item.id)}
                />
              );
            })}
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-5 z-50">
        <button
          type="button"
          onClick={() => router.push(`/r/${props.restaurant.slug}/my-items`)}
          className="group flex items-center gap-3 bg-primary hover:bg-sky-400 text-background-dark pl-4 pr-5 h-14 rounded-full shadow-[0_8px_30px_rgba(19,182,236,0.4)] transition-all active:scale-95 cursor-pointer"
          aria-label="Open My Items"
        >
          <div className="relative">
            <IconShoppingBag className="h-7 w-7" />
            {myItems.count > 0 ? (
              <div className="absolute -top-1 -right-1 bg-white text-background-dark text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                {myItems.count}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm font-bold">My Items</span>
            <span className="text-[10px] font-semibold opacity-80">
              {myItems.count} selected
            </span>
          </div>
          <IconArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <LanguageSwitcherSheet
        open={languageOpen}
        onClose={() => setLanguageOpen(false)}
        availableLanguages={availableLanguages}
        selected={selected}
        onSelect={onSelectLanguage}
      />

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters.value}
        onChange={filters.setValue}
        dietaryOptions={props.menu.availableDietaryTags}
        allergenOptions={props.menu.availableAllergens}
        onApply={() => {
          setFilterOpen(false);
        }}
      />
    </div>
  );
}
