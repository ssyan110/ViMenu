import { supabaseRpc } from "@/data/supabase/restRpcClient";

export type GuestRestaurantBySlugResponse = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    tenant_id: string;
    default_language: string;
  };
  published_menu: {
    published_at: string;
    menu_version_id: string;
  } | null;
  languages_enabled: string[];
};

export async function getGuestRestaurantBySlug(slug: string) {
  return supabaseRpc<GuestRestaurantBySlugResponse>({
    fn: "rpc_guest_restaurant_by_slug",
    body: { p_slug: slug },
  });
}
