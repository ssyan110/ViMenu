"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { getBilingualName } from "@/application/bilingualMenuText";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  normalizeLanguageCode,
} from "@/domain/language";
import type { GuestItemDetail } from "@/domain/menu/models";
import { cn } from "@/shared/cn";
import { LanguageSwitcherSheet } from "@/ui/components/LanguageSwitcherSheet";
import { useLanguageSelection } from "@/ui/hooks/useLanguageSelection";
import { useMyItems } from "@/ui/hooks/useMyItems";
import {
  IconArrowLeft,
  IconCheck,
  IconFlame,
  IconInfo,
  IconMinus,
  IconPlus,
  IconShare,
  IconShoppingBag,
} from "@/ui/icons";

function formatMacro(value: number | undefined, suffix: string) {
  if (value == null) return "—";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}${suffix}`;
}

function formatKcal(value: number | undefined) {
  if (value == null) return "—";
  return `${Math.round(value)} kcal`;
}

function startCaseFromCode(code: string) {
  return code
    .trim()
    .split(/[_\-\s]+/g)
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
}

function SectionHeading(props: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2">
      {props.children}
    </h3>
  );
}

export function GuestItemDetailScreen(props: {
  initialSearchParams?: {
    lang?: string;
    cat?: string;
    diet?: string;
    excl?: string;
  };
  availableLanguages: LanguageCode[];
  detail: GuestItemDetail;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryLang = props.initialSearchParams?.lang ?? searchParams.get("lang");

  const { selected, select, persist } = useLanguageSelection({
    restaurantSlug: props.detail.restaurant.slug,
    queryLang,
  });

  const myItems = useMyItems({ restaurantSlug: props.detail.restaurant.slug });

  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [qty, setQty] = React.useState(1);
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [props.detail.item.imageUrl]);

  const bilingual = React.useMemo(() => {
    return getBilingualName({
      nameVi: props.detail.item.nameVi,
      nameByLang: props.detail.item.nameByLang,
      selectedLanguage: selected,
      fallbackSecondaryLanguage: props.availableLanguages.includes("en")
        ? "en"
        : DEFAULT_LANGUAGE,
    });
  }, [
    props.availableLanguages,
    props.detail.item.nameByLang,
    props.detail.item.nameVi,
    selected,
  ]);

  const description =
    props.detail.item.descriptionByLang?.[normalizeLanguageCode(selected)] ??
    props.detail.item.descriptionVi;

  const goBack = React.useCallback(() => {
    const cat = props.initialSearchParams?.cat ?? searchParams.get("cat");
    const diet = props.initialSearchParams?.diet ?? searchParams.get("diet");
    const excl = props.initialSearchParams?.excl ?? searchParams.get("excl");

    const sp = new URLSearchParams();
    if (selected) sp.set("lang", selected);
    if (cat) sp.set("cat", cat);
    if (diet) sp.set("diet", diet);
    if (excl) sp.set("excl", excl);

    router.push(`/r/${props.detail.restaurant.slug}?${sp.toString()}`);
  }, [
    props.detail.restaurant.slug,
    props.initialSearchParams,
    router,
    searchParams,
    selected,
  ]);

  const onSelectLanguage = React.useCallback(
    (code: LanguageCode) => {
      select(code);
      persist();

      const current =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams(searchParams.toString());

      current.set("lang", code);
      router.replace(`?${current.toString()}`);
      setLanguageOpen(false);
    },
    [persist, router, searchParams, select],
  );

  const isInMyItems = myItems.itemIds.includes(props.detail.item.id);

  const badge = React.useMemo(() => {
    const codes = (props.detail.item.badges ?? []).map((b) => b.code);
    const normalized = new Set(codes.map((c) => c.trim().toLowerCase()));
    if (normalized.has("popular")) return "Popular";
    if (normalized.has("best_seller") || normalized.has("bestseller"))
      return "Best seller";
    return null;
  }, [props.detail.item.badges]);

  const exclRaw = props.initialSearchParams?.excl ?? searchParams.get("excl");
  const freeFromCodes = React.useMemo(() => {
    const selected = (exclRaw ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!selected.length) return [];

    const contains = new Set(
      (props.detail.item.allergens ?? []).map((a) =>
        a.code.trim().toLowerCase(),
      ),
    );

    return selected.filter((c) => !contains.has(c));
  }, [exclRaw, props.detail.item.allergens]);

  const hasImage = Boolean(props.detail.item.imageUrl) && !imageFailed;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 antialiased overflow-x-hidden selection:bg-primary selection:text-white min-h-[100dvh]">
      <div className="relative flex flex-col min-h-[100dvh] w-full bg-background-light dark:bg-background-dark">
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto pointer-events-none">
          <button
            type="button"
            onClick={goBack}
            className={cn(
              "pointer-events-auto",
              "size-10 rounded-full flex items-center justify-center text-white",
              "bg-black/30 backdrop-blur-[8px] border border-white/10",
              "active:scale-95 transition-transform",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
            )}
            aria-label="Back"
          >
            <IconArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-3 pointer-events-auto">
            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className={cn(
                "size-10 rounded-full flex items-center justify-center text-white",
                "bg-black/30 backdrop-blur-[8px] border border-white/10",
                "active:scale-95 transition-transform",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
              )}
              aria-label="Change language"
            >
              <span className="text-[12px] font-extrabold tracking-wide">
                {selected.toUpperCase()}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                // UI-only: no fake data / no side-effects.
              }}
              className={cn(
                "size-10 rounded-full flex items-center justify-center text-white",
                "bg-black/30 backdrop-blur-[8px] border border-white/10",
                "active:scale-95 transition-transform",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
              )}
              aria-label="Share"
            >
              <IconShare className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative h-[45vh] md:h-[52vh] max-h-[560px] w-full shrink-0 bg-gradient-to-br from-gray-800 to-gray-900">
          {hasImage && props.detail.item.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={props.detail.item.imageUrl}
                alt={bilingual.primary}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                onError={() => setImageFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-black/30" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-2">🍽️</div>
                <p className="text-sm font-medium">No image available</p>
              </div>
            </div>
          )}
        </div>

        <main className="relative z-10 -mt-8 flex-1 bg-background-light dark:bg-background-dark rounded-t-3xl px-5 md:px-8 lg:px-12 pt-8 pb-32 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full opacity-50" />

          <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
            <div className="md:col-span-2 lg:col-span-1">
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                    {bilingual.primary}
                  </h1>
                  {props.detail.item.priceText ? (
                    <span className="shrink-0 text-xl font-bold text-primary">
                      {props.detail.item.priceText}
                    </span>
                  ) : null}
                </div>

                {bilingual.secondary ? (
                  <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                    {bilingual.secondary}
                  </h2>
                ) : null}

                {(badge || props.detail.category) && (
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    {badge ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wide">
                        {badge}
                      </span>
                    ) : null}
                    {props.detail.category ? (
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {
                          getBilingualName({
                            nameVi: props.detail.category.nameVi,
                            nameByLang: props.detail.category.nameByLang,
                            selectedLanguage: selected,
                          }).primary
                        }
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {(props.detail.item.dietaryTagsWithLabels?.length ?? 0) > 0 ? (
                <div className="mb-6">
                  <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                    {props.detail.item.dietaryTagsWithLabels!.map((t) => (
                      <span
                        key={`diet-${t.code}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap",
                          "border-gray-200 dark:border-gray-700",
                          "bg-white dark:bg-white/5",
                          "text-gray-600 dark:text-gray-300",
                        )}
                        title={t.labelVi}
                      >
                        <IconCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{t.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              {description ? (
                <div className="mb-8">
                  <SectionHeading>Description</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              ) : null}

              {props.detail.item.nutrition ? (
                <div className="mb-8 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg">
                    <IconFlame className="h-5 w-5 text-orange-400" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] uppercase text-gray-400 font-bold">
                        Energy
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatKcal(props.detail.item.nutrition.calories)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg">
                    <IconInfo className="h-5 w-5 text-blue-400" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] uppercase text-gray-400 font-bold">
                        Protein
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatMacro(props.detail.item.nutrition.proteinG, "g")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg">
                    <IconInfo className="h-5 w-5 text-yellow-400" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] uppercase text-gray-400 font-bold">
                        Carbs
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatMacro(props.detail.item.nutrition.carbsG, "g")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {(props.detail.item.allergens?.length ?? 0) > 0 ||
              freeFromCodes.length > 0 ? (
                <div className="mb-8 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2 bg-red-100/50 dark:bg-red-900/20">
                    <IconInfo className="h-5 w-5 text-red-500 dark:text-red-400" />
                    <h3 className="font-bold text-red-800 dark:text-red-200">
                      Allergens &amp; Safety
                    </h3>
                  </div>

                  <div className="p-4 grid grid-cols-1 gap-4">
                    {(props.detail.item.allergens?.length ?? 0) > 0 ? (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 size-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                          <span className="text-red-600 dark:text-red-400 text-sm font-bold">
                            ×
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-red-600 dark:text-red-400 mb-1">
                            Contains
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {props.detail.item.allergens!.map((a) => (
                              <span
                                key={`contains-${a.code}`}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-white dark:bg-black/40 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                                title={a.displayVi}
                              >
                                {a.display}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {(props.detail.item.allergens?.length ?? 0) > 0 &&
                    freeFromCodes.length > 0 ? (
                      <div className="h-px bg-red-200 dark:bg-red-900/30 w-full" />
                    ) : null}

                    {freeFromCodes.length > 0 ? (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 size-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                          <IconCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-green-600 dark:text-green-400 mb-1">
                            Free From
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {freeFromCodes.map((code) => (
                              <span
                                key={`free-${code}`}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-white dark:bg-black/40 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 opacity-80"
                                title={code}
                              >
                                {startCaseFromCode(code)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <div
            className={cn(
              "w-full px-5 md:px-8 py-4",
              "pb-[calc(2rem+env(safe-area-inset-bottom))]",
              "bg-[rgba(16,29,34,0.70)] backdrop-blur-[12px]",
              "border-t border-white/5",
              "flex items-center justify-between gap-4",
            )}
          >
            <div className="flex items-center bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg h-12 px-1 shrink-0">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="size-10 flex items-center justify-center text-gray-500 hover:text-primary active:scale-90 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                aria-label="Decrease quantity"
              >
                <IconMinus className="h-5 w-5" />
              </button>
              <span className="w-8 text-center font-bold text-lg">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="size-10 flex items-center justify-center text-gray-500 hover:text-primary active:scale-90 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                aria-label="Increase quantity"
              >
                <IconPlus className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isInMyItems) myItems.remove(props.detail.item.id);
                else myItems.add(props.detail.item.id);
              }}
              className={cn(
                "flex-1 h-12 font-bold rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                isInMyItems
                  ? "bg-white/10 text-white border border-white/10"
                  : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(19,182,236,0.4)]",
              )}
              aria-label={
                isInMyItems ? "Remove from My Items" : "Add to My Items"
              }
            >
              <span>{isInMyItems ? "Added" : "Add to My Items"}</span>
              <IconShoppingBag className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <LanguageSwitcherSheet
        open={languageOpen}
        onClose={() => setLanguageOpen(false)}
        availableLanguages={props.availableLanguages}
        selected={selected}
        onSelect={onSelectLanguage}
      />
    </div>
  );
}
