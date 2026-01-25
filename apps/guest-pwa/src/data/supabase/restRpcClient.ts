export class SupabaseRestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "SupabaseRestError";
  }
}

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function isDebugEnabled() {
  const v =
    getEnv("VIMENU_DEBUG_API") ?? getEnv("NEXT_PUBLIC_VIMENU_DEBUG_API");
  return v === "1" || v === "true";
}

export function getSupabaseConfig() {
  const url =
    getEnv("SUPABASE_URL") ??
    getEnv("NEXT_PUBLIC_SUPABASE_URL") ??
    "https://ycjgqywqcmtznzrxafuc.supabase.co";

  const anonKey =
    getEnv("SUPABASE_ANON_KEY") ?? getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return { url, anonKey };
}

export async function supabaseRpc<TResponse>(params: {
  fn: string;
  body: Record<string, unknown>;
  urlOverride?: string;
  anonKeyOverride?: string;
  signal?: AbortSignal;
}): Promise<TResponse> {
  const cfg = getSupabaseConfig();
  const baseUrl = params.urlOverride ?? cfg.url;
  const anonKey = params.anonKeyOverride ?? cfg.anonKey;

  if (!anonKey) {
    throw new SupabaseRestError(
      "Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/guest-pwa/.env.local",
      401,
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Supabase REST typically requires `apikey` and `Authorization`.
  headers.apikey = anonKey;
  headers.Authorization = `Bearer ${anonKey}`;

  if (isDebugEnabled()) {
    console.info("[vimenu][rpc] POST", `${baseUrl}/rest/v1/rpc/${params.fn}`, {
      body: params.body,
    });
  }

  const res = await fetch(`${baseUrl}/rest/v1/rpc/${params.fn}`, {
    method: "POST",
    headers,
    body: JSON.stringify(params.body),
    signal: params.signal,
    cache: "no-store",
  });

  if (!res.ok) {
    let details: unknown = undefined;
    try {
      details = await res.json();
    } catch {
      // ignore
    }

    if (isDebugEnabled()) {
      console.warn("[vimenu][rpc] ERROR", params.fn, res.status, details);
    }
    throw new SupabaseRestError(
      `Supabase RPC failed: ${params.fn} (${res.status})`,
      res.status,
      details,
    );
  }

  const data = (await res.json()) as TResponse;
  if (isDebugEnabled()) {
    console.info("[vimenu][rpc] OK", params.fn);
  }
  return data;
}
