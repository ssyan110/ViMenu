import { getGuestRestaurantBySlug } from "@/data/guest/getGuestRestaurantBySlug";
import { DEFAULT_LANGUAGE, normalizeLanguageCode } from "@/domain/language";
import { LanguageEntryScreen } from "@/ui/screens/LanguageEntryScreen";

export default async function RestaurantEntryPage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    console.info("[vimenu][entry] loading restaurant by slug", params.slug);
    const data = await getGuestRestaurantBySlug(params.slug);
    console.info("[vimenu][entry] loaded restaurant", {
      id: data.restaurant.id,
      slug: data.restaurant.slug,
      name: data.restaurant.name,
      languages_enabled: data.languages_enabled,
    });

    const availableLanguages = Array.from(
      new Set([
        DEFAULT_LANGUAGE,
        ...data.languages_enabled.map((c) => normalizeLanguageCode(c)),
      ]),
    );

    return (
      <LanguageEntryScreen
        restaurant={{
          id: data.restaurant.id,
          slug: data.restaurant.slug,
          name: data.restaurant.name,
        }}
        availableLanguages={availableLanguages}
        hero={{
          greetingVi: "Xin chào!",
          greetingEn: "Welcome",
        }}
      />
    );
  } catch (err) {
    console.warn("[vimenu][entry] failed to load restaurant", params.slug, err);
    // If env is not configured (missing anon key) or network fails,
    // keep the entry screen usable with a safe fallback.
    return (
      <LanguageEntryScreen
        restaurant={{
          id: "unknown",
          slug: params.slug,
          name: params.slug,
        }}
        availableLanguages={[DEFAULT_LANGUAGE]}
        hero={{
          greetingVi: "Xin chào!",
          greetingEn: "Welcome",
        }}
      />
    );
  }
}
