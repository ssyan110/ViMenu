import { mapGuestMenuResponse } from "@/application/guestMenuMapper";
import { getGuestMenu } from "@/data/guest/getGuestMenu";
import { getGuestRestaurantBySlug } from "@/data/guest/getGuestRestaurantBySlug";
import { DEFAULT_LANGUAGE, normalizeLanguageCode } from "@/domain/language";
import { isVimenuDebugEnabled } from "@/shared/debug";
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

    const debugApi = isVimenuDebugEnabled();

    const [restaurant, menu] = await Promise.all([
      getGuestRestaurantBySlug(params.slug),
      getGuestMenu({ slug: params.slug, langCode: lang }),
    ]);

    if (debugApi) {
      const categoryCount = menu.categories?.length ?? 0;
      const itemCount = (menu.categories ?? []).reduce(
        (sum, c) => sum + (c.items?.length ?? 0),
        0,
      );

      console.info("[vimenu][menu] rpc_guest_restaurant_by_slug OK", {
        slug: params.slug,
        restaurant: restaurant.restaurant?.name,
        languages_enabled: restaurant.languages_enabled,
      });
      console.info("[vimenu][menu] rpc_guest_menu OK", {
        slug: params.slug,
        lang,
        categories: categoryCount,
        items: itemCount,
      });
    }

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
        initialSearchParams={searchParams}
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
        initialSearchParams={searchParams}
        restaurant={{ slug: params.slug, name: params.slug }}
        availableLanguages={[DEFAULT_LANGUAGE]}
        menu={{
          lang: DEFAULT_LANGUAGE,
          currency: "VND",
          categories: [],
          availableAllergens: [],
          availableDietaryTags: [],
        }}
      />
    );
  }
}
