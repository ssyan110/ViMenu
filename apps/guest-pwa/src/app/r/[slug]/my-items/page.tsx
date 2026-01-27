import { redirect } from "next/navigation";

import { formatPrice } from "@/application/guestMenuMapper";
import { resolvePublicImageUrl } from "@/application/publicImageUrl";
import { getGuestMenu } from "@/data/guest/getGuestMenu";
import { getGuestRestaurantBySlug } from "@/data/guest/getGuestRestaurantBySlug";
import { normalizeLanguageCode } from "@/domain/language";
import type { MenuItem } from "@/domain/menu/models";
import { MyItemsPageClient } from "./MyItemsPageClient";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function MyItemsPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const restaurantData = await getGuestRestaurantBySlug(params.slug);

  if (!restaurantData) {
    redirect("/");
  }

  const lang = normalizeLanguageCode(searchParams.lang ?? "vi");

  // Fetch full menu to get item details
  const menuData = await getGuestMenu({
    slug: params.slug,
    langCode: lang,
  });

  if (!menuData) {
    redirect(`/r/${params.slug}`);
  }

  // Build item lookup map
  const itemsById: Record<string, MenuItem> = {};
  menuData.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      const nameByLang: Record<string, string | undefined> = {};
      if (item.translation?.name) {
        nameByLang[item.translation.lang_code] = item.translation.name;
      }

      const descriptionByLang: Record<string, string | undefined> = {};
      if (item.translation?.description) {
        descriptionByLang[item.translation.lang_code] =
          item.translation.description;
      }

      itemsById[item.id] = {
        id: item.id,
        categoryId: cat.id,
        sku: item.sku ?? undefined,
        price: item.price ?? undefined,
        priceText:
          item.price != null
            ? formatPrice(item.price, menuData.restaurant.currency)
            : undefined,
        priceNote: item.price_note ?? undefined,
        imageUrl: resolvePublicImageUrl(item.image_path),
        nameVi: item.name_vi,
        nameByLang,
        descriptionVi: item.description_vi ?? undefined,
        descriptionByLang,
        badges: item.badges.map((b) => ({
          code: b.code,
          rank: b.rank ?? undefined,
        })),
        allergens: item.allergens.map((a) => ({
          code: a.code,
          display: a.translations?.[lang] ?? a.display_vi,
          displayVi: a.display_vi,
          icon: a.icon ?? undefined,
        })),
        dietaryTags: item.dietary_tags
          ?.filter((t) => t.confirmed)
          .map((t) => t.code),
      };
    });
  });

  return (
    <MyItemsPageClient
      restaurantSlug={params.slug}
      selectedLanguage={lang}
      itemsById={itemsById}
      currency={menuData.restaurant.currency}
    />
  );
}
