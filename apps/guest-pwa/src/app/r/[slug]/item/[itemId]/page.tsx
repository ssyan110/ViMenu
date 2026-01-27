import { mapGuestItemDetailResponse } from "@/application/guestItemDetailMapper";
import { getGuestItemDetail } from "@/data/guest/getGuestItemDetail";
import { getGuestRestaurantBySlug } from "@/data/guest/getGuestRestaurantBySlug";
import { DEFAULT_LANGUAGE, normalizeLanguageCode } from "@/domain/language";
import { isVimenuDebugEnabled } from "@/shared/debug";
import { GuestItemDetailScreen } from "@/ui/screens/GuestItemDetailScreen";
import { notFound } from "next/navigation";

export default async function ItemDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string; itemId: string };
  searchParams?: { lang?: string; cat?: string; diet?: string; excl?: string };
}) {
  const lang = normalizeLanguageCode(searchParams?.lang ?? DEFAULT_LANGUAGE);

  try {
    const debugApi = isVimenuDebugEnabled();

    const [restaurant, detail] = await Promise.all([
      getGuestRestaurantBySlug(params.slug),
      getGuestItemDetail({ itemId: params.itemId, langCode: lang }),
    ]);

    if (debugApi) {
      console.info("[vimenu][item] rpc_guest_item_detail OK", {
        slug: params.slug,
        itemId: params.itemId,
        lang,
        item_name_vi: detail.name_vi,
      });
    }

    const availableLanguages = Array.from(
      new Set([
        DEFAULT_LANGUAGE,
        ...restaurant.languages_enabled.map((c) => normalizeLanguageCode(c)),
      ]),
    );

    const mapped = mapGuestItemDetailResponse({
      response: detail,
      requestedLang: lang,
      restaurantFallback: {
        slug: restaurant.restaurant.slug,
        name: restaurant.restaurant.name,
        currency: restaurant.restaurant.currency,
      },
    });

    return (
      <GuestItemDetailScreen
        initialSearchParams={searchParams}
        availableLanguages={availableLanguages}
        detail={mapped}
      />
    );
  } catch (err) {
    console.warn(
      "[vimenu][item] failed to load item detail",
      { slug: params.slug, itemId: params.itemId, lang },
      err,
    );

    // Prefer 404 so UI stays predictable, but keep a usable fallback if needed.
    return notFound();
  }
}
