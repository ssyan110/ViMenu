import { supabaseRpc } from "@/data/supabase/restRpcClient";
import { isVimenuDebugEnabled, isVimenuDebugFull } from "@/shared/debug";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type GuestFiltersRpcResponse = {
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

export async function GET() {
  return handle();
}

export async function POST() {
  return handle();
}

async function handle() {
  const startedAt = Date.now();
  try {
    const data = await supabaseRpc<GuestFiltersRpcResponse>({
      fn: "rpc_guest_filters",
      body: {},
    });

    console.info("[vimenu][filters] rpc_guest_filters OK", {
      ms: Date.now() - startedAt,
      allergens: data.allergens?.length ?? 0,
      dietary_tags: data.dietary_tags?.length ?? 0,
    });

    if (isVimenuDebugEnabled()) {
      const raw = JSON.stringify(data);
      const limit = isVimenuDebugFull() ? 50_000 : 4_000;
      console.info(
        "[vimenu][filters] rpc_guest_filters payload",
        raw.length > limit ? `${raw.slice(0, limit)}…` : raw,
      );
    }

    return Response.json(data, {
      headers: {
        // Small catalog; allow short-lived caching at the edge/CDN.
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.warn("[vimenu][filters] rpc_guest_filters FAILED", {
      ms: Date.now() - startedAt,
      err,
    });

    return Response.json(
      { error: "failed_to_load_filters" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
