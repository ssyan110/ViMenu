import { supabaseRpc } from "@/data/supabase/restRpcClient";

export type GuestMenuRpcResponse = {
  lang: string;
  categories: Array<{
    id: string;
    name_vi: string;
    sort_order: number;
    items: Array<{
      id: string;
      sku: string | null;
      price: number | null;
      price_note: string | null;
      name_vi: string;
      description_vi: string | null;
      image_path: string | null;
      badges: Array<{ code: string; rank: number | null }>;
      allergens: Array<{
        code: string;
        icon: string | null;
        confirmed: boolean;
        display_vi: string;
      }>;
      translation: {
        lang_code: string;
        approved: boolean;
        name: string | null;
        description: string | null;
      };
    }>;
  }>;
  restaurant: {
    name: string;
    slug: string;
    currency: string;
    tenant_id: string;
    restaurant_id: string;
    default_language: string;
  };
  menu_version: {
    published_at: string;
    menu_version_id: string;
  } | null;
};

export async function getGuestMenu(params: { slug: string; langCode: string }) {
  return supabaseRpc<GuestMenuRpcResponse>({
    fn: "rpc_guest_menu",
    body: {
      p_slug: params.slug,
      p_lang_code: params.langCode,
    },
  });
}
