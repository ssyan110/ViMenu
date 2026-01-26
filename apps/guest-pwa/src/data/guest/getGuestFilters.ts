import { supabaseRpc } from "@/data/supabase/restRpcClient";

export type GuestFiltersRpcResponse = {
  allergens: Array<{
    code: string;
    icon: string | null;
    display_vi: string;
  }>;
  dietary_tags: Array<{
    code: string;
    display_vi: string;
  }>;
};

export async function getGuestFilters() {
  // RPC expects POST; no params needed for the global filter catalog.
  return supabaseRpc<GuestFiltersRpcResponse>({
    fn: "rpc_guest_filters",
    body: {},
  });
}
