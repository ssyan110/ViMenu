import type { GuestMenuRpcResponse } from "@/data/guest/getGuestMenu";
import { getSupabaseConfig } from "@/data/supabase/restRpcClient";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  normalizeLanguageCode,
} from "@/domain/language";
import type {
  GuestMenu,
  GuestMenuCategory,
  MenuAllergenFilterOption,
  MenuDietaryFilterOption,
  MenuItem,
} from "@/domain/menu/models";

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

export function formatPrice(price: number, currency: string): string {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}

function resolvePublicImageUrl(imagePath: string | null): string | undefined {
  if (!imagePath) return undefined;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  // Convention: image_path is "<bucket>/<path>".
  const { url } = getSupabaseConfig();
  return `${url.replace(/\/$/, "")}/storage/v1/object/public/${imagePath.replace(
    /^\//,
    "",
  )}`;
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

export function mapGuestMenuResponse(params: {
  response: GuestMenuRpcResponse;
  requestedLang: LanguageCode;
}): GuestMenu {
  const lang = normalizeLanguageCode(params.response.lang) as LanguageCode;
  const currency = params.response.restaurant.currency;

  const allergenByCode = new Map<string, MenuAllergenFilterOption>();
  const dietaryByCode = new Map<string, MenuDietaryFilterOption>();

  const categories: GuestMenuCategory[] = params.response.categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => {
      const items: MenuItem[] = c.items.map((it) => {
        const translationApproved = Boolean(it.translation?.approved);
        const translatedName =
          translationApproved && it.translation?.name
            ? it.translation.name
            : undefined;
        const translatedDescription =
          translationApproved && it.translation?.description
            ? it.translation.description
            : undefined;

        const allergens = (it.allergens ?? [])
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

        for (const a of allergens) {
          const existing = allergenByCode.get(a.code);
          if (existing) continue;
          allergenByCode.set(a.code, {
            code: a.code,
            label: a.display,
            labelVi: a.displayVi,
            icon: a.icon,
          });
        }

        const dietaryTagsWithLabels = (it.dietary_tags ?? [])
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

        for (const t of dietaryTagsWithLabels) {
          const existing = dietaryByCode.get(t.code);
          if (existing) continue;
          dietaryByCode.set(t.code, {
            code: t.code,
            label: t.label,
            labelVi: t.labelVi,
          });
        }

        const dietaryTags = dietaryTagsWithLabels.map((t) => t.code);

        return {
          id: it.id,
          sku: it.sku ?? undefined,
          categoryId: c.id,
          priceText: formatPriceCompact({ price: it.price, currency }),
          priceNote: it.price_note ?? undefined,
          imageUrl: resolvePublicImageUrl(it.image_path),
          nameVi: it.name_vi,
          nameByLang:
            translatedName && params.requestedLang !== DEFAULT_LANGUAGE
              ? { [params.requestedLang]: translatedName }
              : undefined,
          descriptionVi: it.description_vi ?? undefined,
          descriptionByLang:
            translatedDescription && params.requestedLang !== DEFAULT_LANGUAGE
              ? { [params.requestedLang]: translatedDescription }
              : undefined,
          allergens,
          dietaryTags: dietaryTags.length ? dietaryTags : undefined,
          badges: (it.badges ?? []).map((b) => ({
            code: b.code,
            rank: b.rank ?? undefined,
          })),
        };
      });

      const categoryTranslated =
        c.translation?.approved && c.translation?.name
          ? c.translation.name
          : resolveTranslation({
              translations: c.translations ?? null,
              requestedLang: params.requestedLang,
            });

      return {
        id: c.id,
        nameVi: c.name_vi,
        nameByLang:
          categoryTranslated && params.requestedLang !== DEFAULT_LANGUAGE
            ? { [params.requestedLang]: categoryTranslated }
            : undefined,
        sortOrder: c.sort_order,
        items,
      };
    });

  const availableAllergens = Array.from(allergenByCode.values()).sort((a, b) =>
    a.labelVi.localeCompare(b.labelVi, "vi"),
  );

  const availableDietaryTags = Array.from(dietaryByCode.values()).sort((a, b) =>
    a.labelVi.localeCompare(b.labelVi, "vi"),
  );

  return {
    lang,
    currency,
    categories,
    availableAllergens,
    availableDietaryTags,
  };
}
