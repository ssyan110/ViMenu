import { supabaseRpc } from "@/data/supabase/restRpcClient";

export type GuestMenuRpcResponse = {
  lang: string;
  categories: Array<{
    id: string;
    name_vi: string;
    sort_order: number;
    translation?: {
      name: string | null;
      approved: boolean;
      lang_code: string;
    } | null;
    translations?: Record<string, string> | null;
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
        translations?: Record<string, string> | null;
      }>;
      dietary_tags?: Array<{
        code: string;
        confirmed: boolean;
        display_vi: string;
        translations?: Record<string, string> | null;
      }>;
      translation: {
        name: string | null;
        approved: boolean;
        lang_code: string;
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
