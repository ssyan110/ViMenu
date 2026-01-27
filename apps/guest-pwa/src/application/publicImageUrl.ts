import { getSupabaseConfig } from "@/data/supabase/restRpcClient";

export function resolvePublicImageUrl(
  imagePath: string | null | undefined,
): string | undefined {
  const raw = (imagePath ?? "").trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;

  // Treat leading-slash paths as app-relative (e.g. assets in Next public/).
  if (raw.startsWith("/")) return raw;

  // Common demo/convention: "demo/..." should be served as "/demo/...".
  if (raw.startsWith("demo/")) return `/${raw}`;

  // Default convention: image_path is "<bucket>/<path>" in Supabase Storage.
  const { url } = getSupabaseConfig();
  return `${url.replace(/\/$/, "")}/storage/v1/object/public/${raw.replace(
    /^\//,
    "",
  )}`;
}
