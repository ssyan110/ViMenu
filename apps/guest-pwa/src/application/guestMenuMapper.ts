import type { GuestMenuRpcResponse } from "@/data/guest/getGuestMenu";
import { getSupabaseConfig } from "@/data/supabase/restRpcClient";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  normalizeLanguageCode,
} from "@/domain/language";
import type { GuestMenuCategory, MenuItem } from "@/domain/menu/models";

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

export function mapGuestMenuResponse(params: {
  response: GuestMenuRpcResponse;
  requestedLang: LanguageCode;
}): {
  lang: LanguageCode;
  currency: string;
  categories: GuestMenuCategory[];
} {
  const lang = normalizeLanguageCode(params.response.lang) as LanguageCode;
  const currency = params.response.restaurant.currency;

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
            return [
              {
                code,
                displayVi: a.display_vi,
                icon: a.icon ?? undefined,
              },
            ];
          });

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
          badges: (it.badges ?? []).map((b) => ({
            code: b.code,
            rank: b.rank ?? undefined,
          })),
        };
      });

      return {
        id: c.id,
        nameVi: c.name_vi,
        sortOrder: c.sort_order,
        items,
      };
    });

  return { lang, currency, categories };
}
