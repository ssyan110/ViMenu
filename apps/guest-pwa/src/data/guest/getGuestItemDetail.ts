import { supabaseRpc } from "@/data/supabase/restRpcClient";

export type GuestItemDetailRpcResponse = {
  id: string;
  sku: string | null;
  price: number | null;
  price_note: string | null;
  name_vi: string;
  description_vi: string | null;
  image_path: string | null;

  translation?: {
    name: string | null;
    approved: boolean;
    lang_code: string;
    description: string | null;
  } | null;

  badges?: Array<{ code: string; rank: number | null }>;

  category?: {
    id: string;
    name_vi: string;
    sort_order?: number;
    translation?: {
      name: string | null;
      approved: boolean;
      lang_code: string;
    } | null;
    translations?: Record<string, string> | null;
  } | null;

  allergens?: Array<{
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

  // The RPC currently returns `nutrition` (not `nutrition_estimate`).
  nutrition?: {
    confirmed?: boolean;
    calories: number | null;
    protein_g: number | null;
    fat_g: number | null;
    carbs_g: number | null;
    sodium_mg?: number | null;
    // May include extra fields (id, source, etc) which we ignore.
    [key: string]: unknown;
  } | null;
};

export async function getGuestItemDetail(params: {
  itemId: string;
  langCode: string;
}) {
  // Supabase REST RPC returns:
  // - JSON object if the RPC returns `json/jsonb`
  // - Array of rows if the RPC returns `setof ...`
  // This normalizes both cases to a single object.
  const raw = await supabaseRpc<unknown>({
    fn: "rpc_guest_item_detail",
    body: {
      p_item_id: params.itemId,
      p_lang_code: params.langCode,
    },
  });

  const normalized = Array.isArray(raw) ? raw[0] : raw;

  if (!normalized || typeof normalized !== "object") {
    throw new Error("rpc_guest_item_detail returned empty response");
  }

  const maybeId = (normalized as { id?: unknown }).id;
  if (!maybeId || typeof maybeId !== "string") {
    throw new Error(
      "rpc_guest_item_detail returned invalid shape (missing id)",
    );
  }

  return normalized as GuestItemDetailRpcResponse;
}
