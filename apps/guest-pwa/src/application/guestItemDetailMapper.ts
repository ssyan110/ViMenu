import { resolvePublicImageUrl } from "@/application/publicImageUrl";
import type { GuestItemDetailRpcResponse } from "@/data/guest/getGuestItemDetail";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  normalizeLanguageCode,
} from "@/domain/language";
import type { GuestItemDetail } from "@/domain/menu/models";

function formatPriceCompact(params: {
  price: number | null;
  currency: string;
}): string | undefined {
  const { price, currency } = params;
  if (price == null) return undefined;

  if (currency === "VND") {
    const k = Math.round(price / 1000);
    return `${k}k`;
  }

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return String(price);
  }
}

function normalizeBackendCode(code: string | null | undefined): string | null {
  const c = (code ?? "").trim().toLowerCase();
  return c.length ? c : null;
}

function resolveTranslation(params: {
  translations?: Record<string, string> | null;
  requestedLang: LanguageCode;
}): string | undefined {
  if (!params.translations) return undefined;
  if (params.requestedLang === DEFAULT_LANGUAGE) return undefined;
  const key = normalizeLanguageCode(params.requestedLang);
  const raw = params.translations[key];
  return raw && raw.trim().length ? raw.trim() : undefined;
}

export function mapGuestItemDetailResponse(params: {
  response: GuestItemDetailRpcResponse;
  requestedLang: LanguageCode;
  restaurantFallback: { slug: string; name: string; currency: string };
}): GuestItemDetail {
  const currency = params.restaurantFallback.currency;

  const item = params.response;

  const translationApproved = Boolean(item.translation?.approved);
  const translatedName =
    translationApproved && item.translation?.name
      ? item.translation.name
      : undefined;
  const translatedDescription =
    translationApproved && item.translation?.description
      ? item.translation.description
      : undefined;

  const allergens = (item.allergens ?? [])
    .filter((a) => a && a.confirmed)
    .flatMap((a) => {
      const code = normalizeBackendCode(a.code);
      if (!code) return [];

      const translated = resolveTranslation({
        translations: a.translations ?? null,
        requestedLang: params.requestedLang,
      });

      const displayVi = a.display_vi;
      const display = translated ?? displayVi;

      return [
        {
          code,
          display,
          displayVi,
          icon: a.icon ?? undefined,
        },
      ];
    });

  const dietaryTagsWithLabels = (item.dietary_tags ?? [])
    .filter((t) => t && t.confirmed)
    .flatMap((t) => {
      const code = normalizeBackendCode(t.code);
      if (!code) return [];

      const translated = resolveTranslation({
        translations: t.translations ?? null,
        requestedLang: params.requestedLang,
      });

      const labelVi = t.display_vi;
      const label = translated ?? labelVi;

      return [{ code, label, labelVi }];
    });

  const categoryTranslated =
    item.category?.translation?.approved && item.category.translation?.name
      ? item.category.translation.name
      : resolveTranslation({
          translations: item.category?.translations ?? null,
          requestedLang: params.requestedLang,
        });

  return {
    lang: normalizeLanguageCode(params.requestedLang),
    currency,
    restaurant: {
      slug: params.restaurantFallback.slug,
      name: params.restaurantFallback.name,
    },
    category: item.category
      ? {
          id: item.category.id,
          nameVi: item.category.name_vi,
          nameByLang:
            categoryTranslated && params.requestedLang !== DEFAULT_LANGUAGE
              ? { [params.requestedLang]: categoryTranslated }
              : undefined,
        }
      : undefined,
    item: {
      id: item.id,
      sku: item.sku ?? undefined,
      categoryId: item.category?.id ?? "",
      priceText: formatPriceCompact({ price: item.price, currency }),
      priceNote: item.price_note ?? undefined,
      imageUrl: resolvePublicImageUrl(item.image_path),
      nameVi: item.name_vi,
      nameByLang:
        translatedName && params.requestedLang !== DEFAULT_LANGUAGE
          ? { [params.requestedLang]: translatedName }
          : undefined,
      descriptionVi: item.description_vi ?? undefined,
      descriptionByLang:
        translatedDescription && params.requestedLang !== DEFAULT_LANGUAGE
          ? { [params.requestedLang]: translatedDescription }
          : undefined,
      badges: (item.badges ?? []).map((b) => ({
        code: b.code,
        rank: b.rank ?? undefined,
      })),
      allergens,
      dietaryTags:
        dietaryTagsWithLabels.length > 0
          ? dietaryTagsWithLabels.map((t) => t.code)
          : undefined,
      dietaryTagsWithLabels:
        dietaryTagsWithLabels.length > 0 ? dietaryTagsWithLabels : undefined,
      nutrition: item.nutrition
        ? {
            calories: item.nutrition.calories ?? undefined,
            proteinG: item.nutrition.protein_g ?? undefined,
            fatG: item.nutrition.fat_g ?? undefined,
            carbsG: item.nutrition.carbs_g ?? undefined,
            sodiumMg: item.nutrition.sodium_mg ?? undefined,
          }
        : undefined,
    },
  };
}
