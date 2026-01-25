import { mapGuestMenuResponse } from "@/application/guestMenuMapper";
import { getGuestMenu } from "@/data/guest/getGuestMenu";
import { getGuestRestaurantBySlug } from "@/data/guest/getGuestRestaurantBySlug";
import { DEFAULT_LANGUAGE, normalizeLanguageCode } from "@/domain/language";
import { GuestMenuScreen } from "@/ui/screens/GuestMenuScreen";

export default async function RestaurantPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { lang?: string; cat?: string; diet?: string; excl?: string };
}) {
  try {
    const lang = normalizeLanguageCode(searchParams?.lang ?? DEFAULT_LANGUAGE);
    console.info("[vimenu][menu] loading", { slug: params.slug, lang });

    const [restaurant, menu] = await Promise.all([
      getGuestRestaurantBySlug(params.slug),
      getGuestMenu({ slug: params.slug, langCode: lang }),
    ]);

    const availableLanguages = Array.from(
      new Set([
        DEFAULT_LANGUAGE,
        ...restaurant.languages_enabled.map((c) => normalizeLanguageCode(c)),
      ]),
    );

    const mappedMenu = mapGuestMenuResponse({
      response: menu,
      requestedLang: lang,
    });

    return (
      <GuestMenuScreen
        restaurant={{
          slug: restaurant.restaurant.slug,
          name: restaurant.restaurant.name,
        }}
        availableLanguages={availableLanguages}
        menu={mappedMenu}
      />
    );
  } catch (err) {
    console.warn("[vimenu][menu] failed to load restaurant", params.slug, err);
    return (
      <GuestMenuScreen
        restaurant={{ slug: params.slug, name: params.slug }}
        availableLanguages={[DEFAULT_LANGUAGE]}
        menu={{ lang: DEFAULT_LANGUAGE, currency: "VND", categories: [] }}
      />
    );
  }
}
