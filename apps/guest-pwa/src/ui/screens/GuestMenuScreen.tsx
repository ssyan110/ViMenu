"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { getBilingualName } from "@/application/bilingualMenuText";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  normalizeLanguageCode,
} from "@/domain/language";
import type {
  GuestMenu,
  MenuAllergenCode,
  MenuDietaryTagCode,
  MenuItem,
} from "@/domain/menu/models";
import { cn } from "@/shared/cn";
import { AllergenBadge } from "@/ui/components/AllergenBadge";
import { FilterSheet, type MenuFilters } from "@/ui/components/FilterSheet";
import { LanguageSwitcherSheet } from "@/ui/components/LanguageSwitcherSheet";
import { useLanguageSelection } from "@/ui/hooks/useLanguageSelection";
import { useMyItems } from "@/ui/hooks/useMyItems";
import {
  IconArrowRight,
  IconFilter,
  IconLocation,
  IconPlus,
  IconShoppingBag,
} from "@/ui/icons";

function useMenuFilters(params: { restaurantSlug: string }) {
  const router = useRouter();
  const sp = useSearchParams();

  const value = React.useMemo<MenuFilters>(() => {
    const dietary = (sp.get("diet") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as MenuDietaryTagCode[];

    const excludeAllergens = (sp.get("excl") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as MenuAllergenCode[];

    return { dietary, excludeAllergens };
  }, [sp]);

  const setValue = React.useCallback(
    (next: MenuFilters) => {
      const nextParams = new URLSearchParams(sp.toString());

      if (next.dietary.length) nextParams.set("diet", next.dietary.join(","));
      else nextParams.delete("diet");

      if (next.excludeAllergens.length)
        nextParams.set("excl", next.excludeAllergens.join(","));
      else nextParams.delete("excl");

      router.replace(`/r/${params.restaurantSlug}?${nextParams.toString()}`);
    },
    [params.restaurantSlug, router, sp],
  );

  return { value, setValue };
}

function matchesFilters(item: MenuItem, filters: MenuFilters) {
  const itemAllergens = new Set(
    (item.allergens ?? []).map((a) => a.code as MenuAllergenCode),
  );

  // Dietary tags are plan-gated + admin-confirmed; if the API doesn't provide them yet,
  // we keep the UI but don't hide everything.
  if (filters.dietary.length && (item.dietaryTags?.length ?? 0) > 0) {
    const itemDietary = new Set(item.dietaryTags);
    for (const required of filters.dietary) {
      if (!itemDietary.has(required)) return false;
    }
  }

  for (const excl of filters.excludeAllergens) {
    if (itemAllergens.has(excl)) return false;
  }

  return true;
}

export function GuestMenuScreen(props: {
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
  const queryLang = searchParams.get("lang");

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
  }, [
    DEFAULT_LANGUAGE,
    props.restaurant.slug,
    queryLang,
    router,
    searchParams,
    selected,
  ]);

  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const categories = React.useMemo(
    () => props.menu.categories,
    [props.menu.categories],
  );
  const allItems = React.useMemo(
    () => categories.flatMap((c) => c.items),
    [categories],
  );

  const myItems = useMyItems({ restaurantSlug: props.restaurant.slug });
  const filters = useMenuFilters({ restaurantSlug: props.restaurant.slug });

  const activeCategory = searchParams.get("cat") ?? categories[0]?.id;

  const visibleItems = React.useMemo(() => {
    return allItems
      .filter((it) => it.categoryId === activeCategory)
      .filter((it) => matchesFilters(it, filters.value));
  }, [activeCategory, allItems, filters.value]);

  const onSelectLanguage = React.useCallback(
    (code: LanguageCode) => {
      select(code);
      persist();
      const next = new URLSearchParams(searchParams.toString());
      next.set("lang", code);
      router.replace(`/r/${props.restaurant.slug}?${next.toString()}`);
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
              <div className="flex items-center gap-1 text-xs text-primary">
                <IconLocation className="h-4 w-4" />
                <span className="opacity-90 truncate">
                  {props.restaurant.locationText ?? "Hanoi, Vietnam"}
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
            const next = new URLSearchParams(searchParams.toString());
            next.set("cat", c.id);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  router.replace(
                    `/r/${props.restaurant.slug}?${next.toString()}`,
                  )
                }
                className={cn(
                  "snap-start shrink-0 h-9 px-5 rounded-full text-sm border transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-primary text-background-dark font-bold shadow-[0_0_15px_rgba(19,182,236,0.3)] border-transparent"
                    : "bg-white/5 hover:bg-white/10 text-white/80 font-medium border-white/10 backdrop-blur-sm",
                )}
              >
                {c.nameVi}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-4 pt-6 flex flex-col gap-5">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-xl font-bold text-white">
            {categories.find((c) => c.id === activeCategory)?.nameVi ?? "Menu"}
          </h2>
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
            {visibleItems.length} Items
          </span>
        </div>

        {visibleItems.map((item) => {
          const bilingual = getBilingualName({
            nameVi: item.nameVi,
            nameByLang: item.nameByLang,
            selectedLanguage: selected,
            fallbackSecondaryLanguage: availableLanguages.includes("en")
              ? "en"
              : DEFAULT_LANGUAGE,
          });

          const isImageCard = Boolean(item.imageUrl);

          if (isImageCard) {
            const hasPopularBadge = (item.badges ?? []).some((b) =>
              ["popular", "best_seller"].includes(String(b.code).toLowerCase()),
            );

            return (
              <article
                key={item.id}
                className="glass-card rounded-2xl p-3 flex gap-4 shadow-lg group relative overflow-hidden"
              >
                <div className="w-28 shrink-0 relative rounded-xl overflow-hidden aspect-square bg-gray-800">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                    aria-hidden="true"
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
                        {bilingual.primary}
                      </h3>
                      {item.priceText ? (
                        <span className="text-primary font-bold text-base whitespace-nowrap">
                          {item.priceText}
                        </span>
                      ) : null}
                    </div>
                    {bilingual.secondary ? (
                      <p className="text-white/50 text-sm italic font-medium mt-0.5 truncate">
                        {bilingual.secondary}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    <div className="flex gap-2">
                      {(item.allergens ?? []).slice(0, 2).map((a) => (
                        <AllergenBadge
                          key={`${item.id}-alg-${a.code}`}
                          code={a.code}
                          icon={a.icon}
                          title={a.displayVi}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => myItems.add(item.id)}
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
            <article
              key={item.id}
              className="glass-card rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group active:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-white text-lg font-bold leading-tight min-w-0 truncate">
                  {bilingual.primary}
                </h3>
                {item.priceText ? (
                  <span className="text-primary font-bold text-lg whitespace-nowrap">
                    {item.priceText}
                  </span>
                ) : null}
              </div>

              {bilingual.secondary ? (
                <p className="text-white/50 text-sm font-medium italic -mt-2 truncate">
                  {bilingual.secondary}
                </p>
              ) : null}

              {(item.descriptionByLang?.[normalizeLanguageCode(selected)] ??
              item.descriptionVi) ? (
                <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                  {item.descriptionByLang?.[normalizeLanguageCode(selected)] ??
                    item.descriptionVi}
                </p>
              ) : null}

              <div className="flex items-center justify-between gap-4 mt-1">
                <div className="flex flex-wrap gap-2">
                  {(item.allergens ?? []).slice(0, 3).map((a) => (
                    <AllergenBadge
                      key={`${item.id}-alg-${a.code}`}
                      code={a.code}
                      icon={a.icon}
                      title={a.displayVi}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => myItems.add(item.id)}
                  className="size-9 rounded-full bg-primary text-background-dark flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer shrink-0"
                  aria-label="Add to My Items"
                >
                  <IconPlus className="h-5 w-5" />
                </button>
              </div>
            </article>
          );
        })}
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
        onApply={() => {
          setFilterOpen(false);
        }}
      />
    </div>
  );
}
